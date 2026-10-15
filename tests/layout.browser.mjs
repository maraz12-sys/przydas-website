import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('dist'),out=path.resolve('tmp-audit');fs.mkdirSync(out,{recursive:true});
const server=createServer((req,res)=>{let p=path.join(root,decodeURI(new URL(req.url,'http://localhost').pathname));if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!p.startsWith(root)||!fs.existsSync(p)){res.statusCode=404;return res.end('Not found')}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p))});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});const results=[],errors=[];
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['/','/test/']){
   await page.goto(origin+route);await page.locator('h1').waitFor();
   const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,formY:document.querySelector('form')?.getBoundingClientRect().top,login:[...document.querySelectorAll('a')].filter(a=>a.textContent.includes('Zaloguj')||a.textContent.includes('Mam już konto')).map(a=>({y:a.getBoundingClientRect().y,visible:!!a.getClientRects().length})),missingAnchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(id=>id&&!document.getElementById(id))}));
   assert.ok(metrics.scroll<=width+1,`${route}/${width}: horizontal overflow`);assert.equal(metrics.missingAnchors.length,0,JSON.stringify(metrics.missingAnchors));
   assert.ok(metrics.login.some(a=>a.visible&&a.y<120),'login visible at top');
   if(route==='/test/'&&width===390)assert.ok(metrics.formY<750,`signup form starts at ${metrics.formY}`);
   await page.screenshot({path:path.join(out,`${route==='/'?'home':'signup'}-${width}.png`),fullPage:route!=='/'});
   results.push({route,...metrics});
  }await page.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({cases:results.length,results,errors}));
}finally{await browser.close();await new Promise(r=>server.close(r))}
