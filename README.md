# Landing page para escritório de advocacia — template

Template leve de landing page para advogados: HTML estático, sem frameworks, ~260 KB no total.

- `index.html` — a página pronta para publicar (HTML + CSS + ~1 KB de JS inline)
- `assets/` — imagens em WebP
- `Main.dc.html` — fonte do design; `build.js` gera o `index.html` a partir dele

## Personalizar

Troque os textos de exemplo (`[SEU TELEFONE]`, `[SEU E-MAIL]`, `[SEU ENDEREÇO]`, `[DIAS E HORÁRIOS]`), nomes e o número do WhatsApp (`WA_PHONE` em `Main.dc.html`, formato DDI+DDD+número). Depois regenere:

```bash
node build.js .
```

O formulário de contato abre o WhatsApp do escritório com a mensagem preenchida — não precisa de back-end.

## Rodar localmente

```bash
python -m http.server
```

e abra `http://localhost:8000`.

## Publicar

Qualquer hospedagem estática serve (Vercel, Netlify, GitHub Pages). Na Vercel, importe o repositório sem configurar build.
