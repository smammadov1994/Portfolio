import {build} from 'esbuild';
await build({entryPoints:['src/weasel-story.jsx','src/pumpads-story.jsx','src/swipebuilder-story.jsx','src/jobtarget-story.jsx','src/ai-stories.jsx'],bundle:true,minify:true,format:'esm',target:['es2020'],jsx:'automatic',outdir:'dist/assets',splitting:true,define:{'process.env.NODE_ENV':'"production"'},legalComments:'none'});
await build({entryPoints:['src/hero-scene.js'],bundle:true,minify:true,format:'esm',target:['es2020'],outdir:'dist/assets',legalComments:'none'});
console.log('Built the portfolio stories.');
