import {makeResponse} from '/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/real/workloads';
import {makeExpandedResponse} from './runtime/workloads';
// Preserve original scenario identity, then add one actual expanded controls/chart
// block. Both styling arms and SSR companions receive exactly this same program.
export function makeFullResponse(scenario='chat',size=2){const base=makeResponse(scenario,size),expanded=makeExpandedResponse(1).replace(/\bheading\b/g,'expandedHeading');const root=/^root = Card\(\[([^\]]*)\]\)/;const a=base.match(root),b=expanded.match(root);if(!a||!b)throw Error('Root-first fixture DSL contract changed');return 'root = Card(['+a[1]+', '+b[1]+'])'+base.slice(a[0].length)+expanded.slice(b[0].length);}
