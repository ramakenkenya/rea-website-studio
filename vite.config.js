import {defineConfig} from 'vite';
export default defineConfig({
 base:'./',
 build:{rollupOptions:{output:{manualChunks:(id)=>id.includes('node_modules/grapesjs')?'editor':id.includes('node_modules/jszip')?'zip':undefined}}}
});
