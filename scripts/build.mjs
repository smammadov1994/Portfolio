import {build} from 'esbuild';
await build({entryPoints:['src/weasel-story.jsx','src/pumpads-story.jsx'],bundle:true,minify:true,format:'esm',target:['es2020'],jsx:'automatic',outdir:'dist/assets',splitting:true,define:{'process.env.NODE_ENV':'"production"'},legalComments:'none'});
console.log('Built the Weaszel Remotion story.');
