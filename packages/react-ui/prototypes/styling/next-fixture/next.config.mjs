// Monorepo fixture resolution only; no styling plugin, registry or compiler config.
import {fileURLToPath} from 'node:url';
export default {turbopack:{root:fileURLToPath(new URL('..',import.meta.url))}};
