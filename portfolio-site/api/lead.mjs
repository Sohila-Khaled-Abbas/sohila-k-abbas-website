import {handleLead} from '../server/lead.mjs';

export async function POST(request){
  return handleLead(request);
}
