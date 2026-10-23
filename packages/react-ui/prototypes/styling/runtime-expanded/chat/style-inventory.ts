import descriptors from './runtime/boundary-descriptors.json';import metadata from './runtime/boundary-metadata.json';import provenance from './runtime/provenance.json';import {ownedStyle} from './runtime/adapter';
export const units=Object.fromEntries(Object.entries(descriptors).map(([unit,descriptor])=>{const resource=ownedStyle(unit as any,descriptor,true);return [unit,{cssBytes:Buffer.byteLength(resource.css),rows:(metadata as any)[unit],source:(provenance as any).units[unit]}];}));

import {makeFullResponse} from './response';export const responses={chat:makeFullResponse('chat',2),dashboard:makeFullResponse('dashboard',2)};
