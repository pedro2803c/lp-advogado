const fs = require('fs'), path = require('path');
const dir = process.argv[2];
let src = fs.readFileSync(path.join(dir, 'Main.dc.html'), 'utf8');

// --- data from the component script
const js = src.slice(src.indexOf('<script type="text/x-dc"'));
const AREAS = eval(js.match(/const AREAS = (\[[\s\S]*?\]);/)[1]);
const TESTIS = eval(js.match(/const TESTIS = (\[[\s\S]*?\]);/)[1]);
const WA_PHONE = js.match(/const WA_PHONE = '(\d+)'/)[1];
const WA = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent('Olá! Gostaria de falar com um advogado do Martins & Rocha.');

let css = src.match(/<style>([\s\S]*?)<\/style>/)[1];
let body = src.slice(src.indexOf('<div class="mr"'), src.lastIndexOf('</x-dc>'));

// --- expand loops
const loop = (html, as, list) => html.replace(new RegExp(`<sc-for list="\\{\\{\\w+\\}\\}" as="${as}"[^>]*>([\\s\\S]*?)</sc-for>`), (_, tpl) =>
  list.map(item => tpl.replace(new RegExp(`\\{\\{${as}\\.(\\w+)\\}\\}`, 'g'), (m, k) => item[k])).join(''));
body = loop(body, 'area', AREAS);
body = loop(body, 't', TESTIS);

// --- conditionals -> hidden elements
body = body.replace(/<sc-if value="\{\{menuOpen\}\}"[^>]*>\s*<nav class="mobile-menu wrap"/, '<nav id="mm" hidden class="mobile-menu wrap"').replace(/<\/nav>\s*<\/sc-if>/, '</nav>');
body = body.replace(/<sc-if value="\{\{sent\}\}"[^>]*>\s*<p role="status"/, '<p id="sent" hidden role="status"').replace(/<\/p>\s*<\/sc-if>/, '</p>');

// --- bindings
body = body.replace(/\{\{waLink\}\}/g, WA.replace(/&/g, '&amp;'))
  .replace(/aria-expanded="\{\{menuExpanded\}\}"/, 'aria-expanded="false" aria-controls="mm"')
  .replace(/required="\{\{ true \}\}"/g, 'required')
  .replace(/ on(Change|Submit)="\{\{\w+\}\}"/g, '')
  .replace(/ onClick="\{\{(\w+)\}\}"/g, ' data-act="$1"')
  .replace(/autoComplete=/g, 'autocomplete=')
  .replace(/<form class="contact-form"/, '<form id="cf" class="contact-form"')
  .replace(/<div class="areas-grid"/, '<div id="ag" class="areas-grid"')
  .replace(/<div class="testi-grid"/, '<div id="tg" class="testi-grid"');

// --- images: webp + dimensions + lazy
const dims = {
  c04342804e05e95491a4a68345a3b409: [1600, 892], '897a72fba62c4058316b6726b6312cbb': [1376, 768], eb78a4d8ab3b1c7433fb8131f75aa896: [1000, 558],
  c2e411f2008505c2be19b8d087387e4a: [720, 402], '3f91c6fc7326dbc1afa1409ffd72baed': [720, 402], cd94f69a07383a94e38c35b350ffc036: [720, 402], '85e43bbf4d50a363f2d59b6a07a3e47a': [720, 402],
  '1549b21dfd5333b4a849908091f17f5e': [168, 168], '893430b8108d3c85b626ab8d0799f0d6': [168, 168], b165e7eaafd6ebf8257c17d41a730072: [168, 168]
};
body = body.replace(/<img ([^>]*?)src="\.\/assets\/(\w+)\.jpg"/g, (m, pre, id) => {
  const [w, h] = dims[id];
  const hero = id === 'c04342804e05e95491a4a68345a3b409';
  return `<img ${pre}src="assets/${id}.webp" width="${w}" height="${h}" decoding="async" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'}`;
});
const leftover = body.match(/\{\{|sc-if|sc-for|\.jpg/);
if (leftover) throw new Error('leftover template syntax: ' + leftover[0]);

// --- minify
css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').trim();
// keep only the last definition of duplicated keyframes (the later one wins anyway)
const kf = {}; css.replace(/@keyframes (\w+)\{(?:[^{}]*\{[^{}]*\})*\}/g, (m, n) => { kf[n] = (kf[n] || 0) + 1; });
for (const n in kf) while (kf[n]-- > 1) css = css.replace(new RegExp(`@keyframes ${n}\\{(?:[^{}]*\\{[^{}]*\\})*\\}`), '');
body = body.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\n+/g, ' ');

const script = `(function(){var d=document,b=d.querySelector('.menu-toggle'),m=d.getElementById('mm');b.onclick=function(){var o=m.hidden;m.hidden=!o;b.setAttribute('aria-expanded',o)};m.onclick=function(e){if(e.target.closest('a')){m.hidden=true;b.setAttribute('aria-expanded',false)}};function rot(g,n){g=d.getElementById(g);n>0?g.appendChild(g.firstElementChild):g.insertBefore(g.lastElementChild,g.firstElementChild)}var A={prevArea:['ag',-1],nextArea:['ag',1],prevTesti:['tg',-1],nextTesti:['tg',1]};d.querySelectorAll('[data-act]').forEach(function(x){var a=A[x.dataset.act];if(a)x.onclick=function(){rot(a[0],a[1])}});var f=d.getElementById('cf');f.onsubmit=function(e){e.preventDefault();var v=function(n){return f.elements[n].value};var t='Olá! Vim pelo site do Martins & Rocha Advogados.\\n\\n*Nome:* '+v('nome')+'\\n*Telefone:* '+v('telefone')+'\\n*E-mail:* '+v('email')+'\\n*Área:* '+v('area')+'\\n\\n*Caso:* '+v('mensagem');window.open('https://wa.me/${WA_PHONE}?text='+encodeURIComponent(t),'_blank','noopener');d.getElementById('sent').hidden=false}})();`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Martins &amp; Rocha Advogados</title><meta name="description" content="Assessoria jurídica completa em Direito Civil, Família, Trabalhista e Empresarial. Atendimento personalizado e mais de 15 anos de experiência."><link rel="preload" as="image" href="assets/c04342804e05e95491a4a68345a3b409.webp" fetchpriority="high"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300..700&amp;family=Manrope:wght@400&amp;display=swap"><style>[hidden]{display:none!important}${css}</style></head><body>${body}<script>${script}</script></body></html>`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('index.html', Buffer.byteLength(html), 'bytes');
