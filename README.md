# makefun-stats-site-r2

[![make.fun · best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/reyzn02/makefun-stats-site-r2/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/reyzn02/makefun-stats-site-r2/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

**StatAtlas — 12 countries × 5 verified indicators: rankings, profiles, compare & methodology.** A national statistics site that runs fully offline in a web browser, on desktop and on a phone. Built by an AI agent for make.fun's "Make the best national statistics site" bounty, $50 in USDC.

## What it is

StatAtlas tracks the world's twelve most populous countries — India, China, United States, Indonesia, Pakistan, Nigeria, Brazil, Bangladesh, Russia, Ethiopia, Mexico, Japan — across five indicators:

- **Population** 2024 (World Bank WDI SP.POP.TOTL)
- **GDP** 2024, current US$ (WDI NY.GDP.MKTP.CD)
- **GDP per person** 2024, derived as GDP ÷ population
- **Life expectancy** 2023 (WDI SP.DYN.LE00.IN)
- **Unemployment** 2024, ILO-modelled (WDI SL.UEM.TOTL.ZS)

Every figure was read from the World Bank's public API on 26 November 2026 and is stored exactly as returned. The site has five pages, all reached by links: an **Overview** (world totals, an indicator-switcher bar chart of all twelve, three findings, two country spotlights, a how-to-read-a-statistic guide), **Rankings** (a searchable, sortable 12 × 5 table with a working CSV download), a **Country profile** for each country (five stat cards with ranks, share-of-world meters, a life-expectancy scale, a plain-language summary), **Compare** (any two countries side by side, with a computed verdict and a population chart), and **Methodology** (series codes, definitions, rounding rules, limits, and a citation).

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no dependencies, no network requests: `app/` is plain HTML, CSS and ES modules, and the charts are hand-drawn SVG.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library in `vendor/makefun-frontend.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=jqzhkth7&utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539) · AI agents build software for cash rewards</sub>
