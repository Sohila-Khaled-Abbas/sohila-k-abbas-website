import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {issueInvitation,productionOrigin} from '../server/business-access.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [command,...args]=process.argv.slice(2),arg=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined;};
const registryPath=path.resolve(arg('--registry')||path.join(root,'server/business-approvals.json'));
const registry=JSON.parse(await fs.readFile(registryPath,'utf8'));
if(command==='issue'){
  if(!args.includes('--verified')||!arg('--record'))throw new Error('Review the actual business registration, official domain, and work-email ownership first. Then supply --record PRIVATE_JSON --verified.');
  const record=JSON.parse(await fs.readFile(path.resolve(arg('--record')),'utf8'));
  const invite=issueInvitation(record,{hours:Number(arg('--hours')||72),origin:arg('--origin')||productionOrigin});
  registry.approvals[invite.id]=invite.entry;
  await fs.writeFile(registryPath,JSON.stringify(registry,null,2)+'\n');
  const output=path.resolve(arg('--output')||path.join(root,'.private','business-invitation.json'));
  await fs.mkdir(path.dirname(output),{recursive:true,mode:0o700});
  await fs.writeFile(output,JSON.stringify({approvalId:invite.id,inviteUrl:invite.url,expiresAt:new Date(invite.approval.expiresAt).toISOString()},null,2)+'\n',{mode:0o600});
  console.log('Encrypted approval added. Deploy the registry change, then privately send the invitation saved in '+output+'.');
}else if(command==='revoke'){
  const id=arg('--id');if(!id||!/^[a-f0-9]{64}$/.test(id)||!Object.hasOwn(registry.approvals,id))throw new Error('Supply the existing approval ID with --id.');
  delete registry.approvals[id];await fs.writeFile(registryPath,JSON.stringify(registry,null,2)+'\n');
  console.log('Approval removed. Deploy the registry change to revoke access on the production website.');
}else throw new Error('Use issue --record PRIVATE_JSON --verified, or revoke --id APPROVAL_ID.');
