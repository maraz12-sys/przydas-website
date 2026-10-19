// Shared, deterministic contract. No HTML, executable conditions or template seeds.
export const TYPES = Object.freeze({short:'Krótka odpowiedź',long:'Długa odpowiedź',single:'Jedna odpowiedź',multiple:'Wiele odpowiedzi',boolean:'Tak / nie',rating:'Ocena liczbowa'});
export const OPS = Object.freeze({eq:'jest równa',neq:'jest inna niż',lte:'jest nie większa niż',gte:'jest nie mniejsza niż',includes:'zawiera'});
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const idPattern = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;
const own = (v,k) => Object.prototype.hasOwnProperty.call(v,k);
const fail = message => { throw new Error(message); };
function text(v,max,label,required=false) {
  if(typeof v!=='string'||v.length>max||(required&&!v.trim())) fail(`${label}: uzupełnij tekst (maks. ${max} znaków).`);
  return v.trim();
}
export function blankSurvey() { return {name:'',title:'',intro:'',thanks:'',questions:[],eventTypeIds:[],isDefault:false,automatic:false,delayHours:24}; }
export function newQuestion(type='short') { return {id:'q_'+crypto.randomUUID().replaceAll('-',''),type,label:'',help:'',required:false,options:[],min:1,max:5,condition:null}; }
export function conditionOps(q) { return q?.type==='rating'?['eq','neq','lte','gte']:q?.type==='multiple'?['includes']:['single','boolean'].includes(q?.type)?['eq','neq']:[]; }
export function validateSurvey(input) {
  if(!object(input))fail('Nieprawidłowa ankieta.');
  const result={name:text(input.name,180,'Nazwa',true),title:text(input.title,180,'Tytuł',true),intro:text(input.intro??'',3000,'Wprowadzenie'),thanks:text(input.thanks??'',1500,'Podziękowanie'),questions:[],eventTypeIds:[],automatic:input.automatic===true,delayHours:input.delayHours??24};
  if(typeof input.automatic!=='boolean')fail('Wybierz sposób wysyłki.');
  if(!Number.isInteger(result.delayHours)||result.delayHours<1||result.delayHours>720)fail('Opóźnienie wysyłki: od 1 do 720 godzin.');
  if(!Array.isArray(input.eventTypeIds)||input.eventTypeIds.length>200||input.eventTypeIds.some(x=>!Number.isSafeInteger(x)||x<=0))fail('Wybierz prawidłowe rodzaje wydarzeń.');
  result.eventTypeIds=[...new Set(input.eventTypeIds)];
  result.isDefault=input.isDefault===true||result.automatic;
  if(result.isDefault&&!result.eventTypeIds.length)fail('Przypisz rodzaj wydarzenia dla ankiety domyślnej.');
  if(result.automatic&&!result.eventTypeIds.length)fail('Przypisz rodzaj wydarzenia przed włączeniem automatu.');
  if(!Array.isArray(input.questions)||input.questions.length<1||input.questions.length>60)fail('Dodaj od 1 do 60 pytań.');
  const seen=new Map();
  for(const raw of input.questions){
    if(!object(raw)||!idPattern.test(raw.id)||seen.has(raw.id)||!own(TYPES,raw.type))fail('Pytanie ma nieprawidłowy typ lub identyfikator.');
    const q={id:raw.id,type:raw.type,label:text(raw.label,500,'Pytanie',true),help:text(raw.help??'',1000,'Podpowiedź'),required:raw.required===true};
    if(['single','multiple'].includes(q.type)){
      if(!Array.isArray(raw.options)||raw.options.length<2||raw.options.length>50)fail(`„${q.label}”: dodaj od 2 do 50 odpowiedzi.`);
      q.options=raw.options.map(v=>text(v,240,'Odpowiedź',true));
      if(new Set(q.options.map(x=>x.toLocaleLowerCase('pl'))).size!==q.options.length)fail(`„${q.label}”: odpowiedzi muszą być różne.`);
    }
    if(q.type==='rating'){
      q.min=raw.min;q.max=raw.max;
      if(!Number.isInteger(q.min)||!Number.isInteger(q.max)||q.min<0||q.max>100||q.min>=q.max)fail(`„${q.label}”: ustaw zakres od 0 do 100, minimum mniejsze od maksimum.`);
    }
    if(raw.condition){
      const c=raw.condition,p=seen.get(c.questionId);
      if(!p||!conditionOps(p).includes(c.op))fail(`„${q.label}”: warunek musi dotyczyć wcześniejszego pytania z wyborem lub oceną.`);
      const value=c.value;
      if(p.type==='rating'&&(!Number.isInteger(value)||value<p.min||value>p.max))fail(`„${q.label}”: wartość warunku jest poza skalą.`);
      if(p.type==='boolean'&&typeof value!=='boolean')fail(`„${q.label}”: wybierz Tak lub Nie w warunku.`);
      if(['single','multiple'].includes(p.type)&&!p.options.includes(value))fail(`„${q.label}”: wybierz istniejącą odpowiedź w warunku.`);
      q.condition={questionId:p.id,op:c.op,value};
    }
    seen.set(q.id,q);result.questions.push(q);
  }
  return result;
}
export function visibleQuestions(schema,answers={}) {
  const visible=new Set();
  return schema.questions.filter(q=>{
    const c=q.condition;
    let show=!c;
    if(c&&visible.has(c.questionId)&&own(answers,c.questionId)){
      const v=answers[c.questionId];
      if(v!==''&&v!==null&&v!==undefined&&(!Array.isArray(v)||v.length)){
        show=c.op==='eq'?v===c.value:c.op==='neq'?v!==c.value:c.op==='lte'?typeof v==='number'&&v<=c.value:c.op==='gte'?typeof v==='number'&&v>=c.value:c.op==='includes'?Array.isArray(v)&&v.includes(c.value):false;
      }
    }
    if(show)visible.add(q.id);return show;
  });
}
export function validateAnswers(schema,input) {
  if(!object(input))return {ok:false,answers:{},errors:{_form:'Nieprawidłowe odpowiedzi.'}};
  const errors={},answers={};
  if(Object.keys(input).some(k=>!schema.questions.some(q=>q.id===k)))errors._form='Formularz zawiera nieznane pytanie. Odśwież stronę.';
  for(const q of visibleQuestions(schema,input)){
    const v=own(input,q.id)?input[q.id]:undefined;
    const empty=v===undefined||v===null||v===''||(typeof v==='string'&&!v.trim())||(Array.isArray(v)&&!v.length);
    if(empty){if(q.required)errors[q.id]='Uzupełnij to pole.';continue;}
    let valid=false;
    if(['short','long'].includes(q.type))valid=typeof v==='string'&&v.length<=(q.type==='short'?500:5000);
    if(q.type==='boolean')valid=typeof v==='boolean';
    if(q.type==='rating')valid=Number.isInteger(v)&&v>=q.min&&v<=q.max;
    if(q.type==='single')valid=typeof v==='string'&&q.options.includes(v);
    if(q.type==='multiple')valid=Array.isArray(v)&&v.length<=q.options.length&&new Set(v).size===v.length&&v.every(x=>q.options.includes(x));
    if(!valid)errors[q.id]='Sprawdź odpowiedź w tym polu.';
    else answers[q.id]=typeof v==='string'?v.trim():v;
  }
  return {ok:Object.keys(errors).length===0,answers,errors};
}
export function summarize(questions,responses){
  return questions.map(q=>{
    const values=responses.filter(a=>visibleQuestions({questions},a).some(x=>x.id===q.id)).map(a=>a[q.id]).filter(v=>v!==undefined&&v!==null&&v!==''&&(!Array.isArray(v)||v.length));
    const row={...q,count:values.length};
    if(q.type==='rating'){const nums=values.filter(v=>Number.isInteger(v)&&v>=q.min&&v<=q.max);row.count=nums.length;row.average=nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:null;}
    if(['rating','single','multiple','boolean'].includes(q.type)){
      const choices=q.type==='rating'?Array.from({length:q.max-q.min+1},(_,i)=>q.min+i):q.type==='boolean'?[true,false]:q.options;
      row.distribution=choices.map(value=>({value,label:typeof value==='boolean'?(value?'Tak':'Nie'):String(value),count:values.filter(v=>Array.isArray(v)?v.includes(value):v===value).length}));
    }else row.texts=values;
    return row;
  });
}
export const normalizeSearch=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[łŁ]/g,'l').toLocaleLowerCase('pl');
