import {handleBusinessInquiry} from '../server/business-inquiry.mjs';

export async function POST(request){return handleBusinessInquiry(request);}
