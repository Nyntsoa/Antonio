import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('portfolio_site/static/js/vendor', { recursive: true });
await copyFile('node_modules/gsap/dist/gsap.min.js', 'portfolio_site/static/js/vendor/gsap.min.js');
console.log('Local GSAP asset ready.');
