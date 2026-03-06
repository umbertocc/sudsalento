# SudSalento - Migrazione Astro

Questo progetto contiene la conversione del sito statico in Astro.

## Stato attuale

- Tutte le pagine da `docs/*.html` sono state migrate in `src/pages/*.html.astro`.
- Gli asset statici principali sono in `public/` (immagini e file SEO: `manifest.json`, `robots.txt`, `sitemap.xml`, `CNAME`, `_headers`).
- Build verificata con successo.

## Comandi

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Nota migrazione

La migrazione è stata fatta in modo conservativo: i contenuti HTML originali sono stati mantenuti per evitare regressioni.

Passo successivo consigliato: rifattorizzare gradualmente in componenti/layout Astro condivisi (`src/layouts`, `src/components`) per ridurre duplicazioni e migliorare manutenzione/performance.
