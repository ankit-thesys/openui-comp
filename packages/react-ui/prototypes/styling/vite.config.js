import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({build:{sourcemap:true,manifest:true,rollupOptions:{input:{index:resolve('index.html'),fixture:resolve('fixture.html'),automatic:resolve('automatic.html')}}}});
