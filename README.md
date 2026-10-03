# Arizona Granite & Stone LLC — website

Built by GreenAI Solutions (greenaidigital.com) for Carlos Marrufo, Waddell AZ.
Static HTML/CSS/JS. No build step, no dependencies, no accounts needed to host it.

- Preview: https://greenaisolution.github.io/arizona-granite-stone/
- Production (after go-live): https://arizonagraniteandstone.com/ — see `GO-LIVE.md`
- Local: `python3 -m http.server 8250` → http://127.0.0.1:8250/

## Where things live

| What | Where |
|------|-------|
| Page content | `index.html` (one page, anchored sections) |
| Styles, light + dark | `styles.css` |
| Edge picker, gallery, form, lightbox | `main.js` |
| Phone / email / reviews | `CONFIG` block at the top of `main.js` |
| Photos (resized + webp) | `assets/img/` — regenerate with `tools/build_images.py` from `assets/orig/` (gitignored) |
| Screenshots | `shots/` (gitignored) — `node tools/shoot.mjs` |

## Facts on the page (all from the client's own site)

Carlos Marrufo · AZ ROC 332009 · (623) 498-9056 · arizonagraniteandstone@gmail.com ·
8539 N 143rd Ave, Waddell, AZ 85355 · showroom by appointment · 7:00 am – 5:00 pm (days unknown) ·
Instagram @arizonagraniteandstonellc · Facebook page 105264658191851.

## Switches

- `<meta name="robots" content="noindex">` in `index.html` is PREVIEW ONLY. Delete at go-live.
- Reviews section is hidden until `CONFIG.reviews` in `main.js` has entries. Real reviews only.
- Quote form posts to FormSubmit (`https://formsubmit.co/ajax/arizonagraniteandstone@gmail.com`).
  First submission triggers a one-time activation email to the client. Nothing delivers until clicked.

## Shipping a change

```bash
git add -A && git commit -m "…" && git push   # live on GitHub Pages in ~1 minute
```
