// Post-measurement accounting correction only. Does not serve or replace a bundle.
import {createHash} from 'node:crypto';
import descriptors from './runtime/boundary-descriptors.json';
import metadata from './runtime/boundary-metadata.json';
import provenance from './runtime/provenance.json';
import {ownedStyle} from './runtime/adapter';
export const units=Object.fromEntries(Object.entries(descriptors).map(([unit,descriptor])=>{const rows=(metadata as any)[unit];const resource=ownedStyle(unit,descriptor,{boundary:true,rows});return [unit,{cssBytes:Buffer.byteLength(resource.css),cssCharacters:resource.css.length,windows1252DecodedCharacters:new TextDecoder('windows-1252').decode(Buffer.from(resource.css,'utf8')).length,cssSha256:createHash('sha256').update(resource.css).digest('hex'),href:resource.href,rowCount:rows.length,source:(provenance as any).units[unit]}];}));
