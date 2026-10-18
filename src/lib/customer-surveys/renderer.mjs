import {visibleQuestions,validateAnswers} from './core.mjs';
// The editor preview and the public page use this exact renderer.
export function mountSurvey(container,{schema,eventLabel='',privacy=null,onSubmit,preview=false}){
  const doc=container.ownerDocument,answers={},fields=new Map();let disposed=false,busy=false;
  const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const root=el('section','customer-survey'),heading=el('h2','',schema.title),form=el('form');form.noValidate=true;
  root.append(heading);
  if(eventLabel)root.append(el('p','cs-muted',eventLabel));
  root.append(el('p','cs-copy',schema.intro),el('p','cs-notice','Ankieta nie jest anonimowa. Odpowiedzi zostaną powiązane z Twoją rezerwacją i będą widoczne dla osoby zarządzającej wydarzeniem. Nie wpisuj danych o zdrowiu ani innych wrażliwych informacji.'));
  const update=()=>{
    const visible=new Set(visibleQuestions(schema,answers).map(q=>q.id));
    for(const [id,f] of fields){f.box.hidden=!visible.has(id);if(f.box.hidden){delete answers[id];for(const c of f.controls){c.removeAttribute('aria-invalid');if(c.type==='checkbox'||c.type==='radio')c.checked=false;else c.value='';}f.error.textContent='';}}
  };
  const prefix='cs-'+Math.random().toString(36).slice(2);
  for(const q of schema.questions){
    const box=el('fieldset','cs-question'),legend=el('legend','',q.label+(q.required?' *':''));box.append(legend);
    const help=el('p','cs-muted',q.help||''),error=el('p','cs-error');help.id=prefix+q.id+'-help';error.id=prefix+q.id+'-error';error.setAttribute('aria-live','polite');box.append(help);
    const controls=[];
    function addControl(control){control.name=q.id;control.setAttribute('aria-describedby',help.id+' '+error.id);if(q.required)control.setAttribute('aria-required','true');controls.push(control);return control;}
    const change=value=>{answers[q.id]=value;error.textContent='';controls.forEach(c=>c.removeAttribute('aria-invalid'));update();};
    if(q.type==='short'||q.type==='long'||q.type==='rating'){
      const control=addControl(el(q.type==='long'?'textarea':'input'));control.setAttribute('aria-label',q.label);
      if(q.type==='rating'){control.type='number';control.min=q.min;control.max=q.max;control.step=1;box.append(el('p','cs-muted',`Skala od ${q.min} do ${q.max}`));}
      else {control.maxLength=q.type==='short'?500:5000;if(q.type==='long')control.rows=4;else control.type='text';}
      control.addEventListener('input',()=>change(q.type==='rating'&&control.value!==''?Number(control.value):control.value));box.append(control);
    }else{
      const options=q.type==='boolean'?[{value:true,label:'Tak'},{value:false,label:'Nie'}]:q.options.map(v=>({value:v,label:v}));
      for(const option of options){
        const label=el('label','cs-option'),control=addControl(el('input'));control.type=q.type==='multiple'?'checkbox':'radio';
        control.addEventListener('change',()=>{if(q.type==='multiple'){const selected=new Set(answers[q.id]||[]);control.checked?selected.add(option.value):selected.delete(option.value);change([...selected]);}else change(option.value);});
        label.append(control,el('span','',option.label));box.append(label);
      }
    }
    box.append(error);fields.set(q.id,{box,error,controls});form.append(box);
  }
  if(privacy?.notice_text){const details=el('details','cs-privacy');details.append(el('summary','','Informacja o danych osobowych'),el('p','cs-copy',privacy.notice_text));root.append(details);}
  const status=el('p','cs-error');status.setAttribute('role','status');
  const submit=el('button','cs-primary',preview?'Sprawdź ankietę w podglądzie':'Wyślij odpowiedzi');submit.type='submit';form.append(status,submit);root.insertBefore(form,root.querySelector('.cs-privacy'));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||disposed)return;status.className='cs-error';
    const result=validateAnswers(schema,answers);
    for(const [id,f] of fields){f.error.textContent=result.errors[id]||'';f.controls.forEach(c=>c.setAttribute('aria-invalid',result.errors[id]?'true':'false'));}
    if(!result.ok){status.textContent='Sprawdź wyróżnione pola.';const first=[...fields.values()].find(f=>f.error.textContent);first?.controls[0]?.focus();return;}
    if(preview){status.className='cs-success';status.textContent='Podgląd: odpowiedzi są poprawne. Niczego nie zapisano ani nie wysłano.';return;}
    busy=true;for(const f of fields.values())for(const control of f.controls)control.disabled=true;form.setAttribute('aria-busy','true');submit.disabled=true;submit.textContent='Zapisywanie…';status.textContent='';
    try{await onSubmit(result.answers);if(disposed)return;form.replaceChildren(el('h3','','Dziękujemy za odpowiedź'),el('p','cs-copy',schema.thanks||'Twoja ankieta została zapisana.'));form.tabIndex=-1;form.focus();}
    catch(e){if(!disposed)status.textContent=e?.message||'Nie udało się zapisać odpowiedzi. Spróbuj ponownie.';}
    finally{busy=false;form.removeAttribute('aria-busy');for(const f of fields.values())for(const control of f.controls)control.disabled=false;submit.disabled=false;submit.textContent='Wyślij odpowiedzi';}
  });
  container.replaceChildren(root);update();
  return ()=>{disposed=true;root.remove();};
}
