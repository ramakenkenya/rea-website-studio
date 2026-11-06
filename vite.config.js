import {defineConfig} from 'vite';
import {textSamplePlugin} from './scripts/text-sample.mjs';
export default defineConfig({
 base:'./',
 plugins:[textSamplePlugin()],
 build:{rollupOptions:{output:{manualChunks:(id)=>id.includes('node_modules/grapesjs')?'editor':id.includes('node_modules/jszip')?'zip':undefined}}}
});
