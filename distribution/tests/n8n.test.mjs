import test from 'node:test';import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'n8n-workflow') {
      return { url: 'data:text/javascript,export class NodeOperationError extends Error { constructor(node, message) { super(message); } }', shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { Ultiwrite } = await import('../adapters/n8n/Ultiwrite.node.ts');
hooks.deregister();
import { UltiwriteApi } from '../adapters/n8n/UltiwriteApi.credentials.ts';
function host(params,reply={ok:true},fail=false){const calls=[];return{calls,getNode:()=>({name:'Ultiwrite'}),getInputData:()=>[{}],getNodeParameter:(k,i,fallback)=>params[k]??fallback,continueOnFail:()=>false,helpers:{httpRequestWithAuthentication:async function(name,req){calls.push({name,req});if(fail)throw Error('SECRET_RESPONSE');return reply;}}};}
test('native n8n node identity and credential class',()=>{assert.equal(new Ultiwrite().description.name,'ultiwrite');assert.equal(new UltiwriteApi().authenticate.type,'generic');});
for(const [operation,path] of [['account','/me'],['usage','/usage'],['getCase','/cases/ev_test'],['getBrief','/cases/ev_test/brief'],['getExport','/reports/r_test/export']])test('n8n '+operation,async()=>{const h=host({operation,caseId:'ev_test',reportId:'r_test'});const output=await new Ultiwrite().execute.call(h);assert.equal(h.calls[0].req.url,'https://dwsoffshorepartners.com/api/v1'+path);assert.equal(h.calls[0].req.disableFollowRedirect,true);assert.deepEqual(output[0][0].pairedItem,{item:0});});
test('n8n page size keeps saved workflows and honors the service limits',async()=>{
 for(const input of [{limit:17},{pageSize:20}]){
  const h=host({operation:'listCases',...input});
  await new Ultiwrite().execute.call(h);
  assert.equal(h.calls[0].req.url,'https://dwsoffshorepartners.com/api/v1/cases?limit='+Object.values(input)[0]);
 }
 const invalid=host({operation:'listCases',pageSize:21});
 await assert.rejects(new Ultiwrite().execute.call(invalid));
 assert.equal(invalid.calls.length,0);
});
test('n8n continuation is deliberate and has long timeout',async()=>{const h=host({operation:'continueCase',caseId:'ev_test'});await new Ultiwrite().execute.call(h);assert.equal(h.calls[0].req.method,'POST');assert.equal(h.calls[0].req.timeout,310000);});
test('n8n refuses hostile identifiers before network',async()=>{const h=host({operation:'getCase',caseId:'../me'});await assert.rejects(new Ultiwrite().execute.call(h));assert.equal(h.calls.length,0);});
test('n8n isolates upstream errors',async()=>{const h=host({operation:'account'},{},true);await assert.rejects(new Ultiwrite().execute.call(h),e=>!e.message.includes('SECRET_RESPONSE'));});
test('n8n no activity on install',()=>{assert.equal(typeof new Ultiwrite().execute,'function');assert.equal(new Ultiwrite().webhook,undefined);});
