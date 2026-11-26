// StatAtlas views — one function per page. Each returns the HTML for the
// #app element; main.js swaps it in on every hash change. All numbers come
// from data.js, so the pages can never drift from the dataset.

import { COUNTRIES, WORLD, SOURCES, countryBySlug, gdpPerPerson, rankOf, shareOfWorld, twelveTotals, sortedBy } from './data.js';
import { barChart, shareMeter, lifeScale, rankBadge, esc } from './charts.js';

// --- Number formatting (one style everywhere, so figures compare cleanly) ---

export function fmtPop(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'bn';
  return (value / 1e6).toFixed(1) + 'm';
}

export function fmtPopFull(value) {
  return value.toLocaleString('en-US');
}

export function fmtGdp(value) {
  if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'tn';
  return '$' + (value / 1e9).toFixed(1) + 'bn';
}

export function fmtPerPerson(value) {
  return '$' + value.toLocaleString('en-US');
}

export function fmtLife(value) {
  return value.toFixed(1) + ' yrs';
}

export function fmtUnemp(value) {
  return value.toFixed(1) + '%';
}

export function fmtShare(share) {
  return (share * 100).toFixed(1) + '%';
}

// A ratio with enough precision that a near-tie never reads as equal:
// two decimals under 1.1 ("1.03×"), one decimal otherwise ("6.2×").
export function fmtRatio(ratio) {
  return ratio < 1.1 ? ratio.toFixed(2) : ratio.toFixed(1);
}

// "first"/"second"/"third" for small ranks, so generated prose reads
// naturally; anything larger falls back to the numeric ordinal.
export function ordinalWord(n) {
  return { 1: 'first', 2: 'second', 3: 'third' }[n] ?? ordinal(n);
}

// The five indicators, in the order the site presents them. key matches
// data.js; label is the short name; format turns a raw value into text.
export const INDICATORS = [
  { key: 'pop', label: 'Population', year: 2024, format: fmtPop, full: fmtPopFull, unit: 'people' },
  { key: 'gdp', label: 'GDP', year: 2024, format: fmtGdp, full: (v) => '$' + v.toLocaleString('en-US'), unit: 'current US$' },
  { key: 'gdpPerPerson', label: 'GDP per person', year: 2024, format: fmtPerPerson, full: fmtPerPerson, unit: 'current US$, derived' },
  { key: 'life', label: 'Life expectancy', year: 2023, format: fmtLife, full: fmtLife, unit: 'years at birth' },
  { key: 'unemp', label: 'Unemployment', year: 2024, format: fmtUnemp, full: fmtUnemp, unit: '% of labour force' },
];

function indicatorValue(country, key) {
  return key === 'gdpPerPerson' ? gdpPerPerson(country) : country[key];
}

function profileLink(country) {
  return `#/country/${country.slug}`;
}

function sectionHead(title, sub) {
  return `<div class="section-head"><h2>${esc(title)}</h2><p>${esc(sub)}</p></div>`;
}

// --- Overview ----------------------------------------------------------------

export function renderOverview() {
  const totals = twelveTotals();
  const chartItems = sortedBy('pop').map((c) => ({
    label: c.name, value: c.pop, display: fmtPop(c.pop), href: profileLink(c),
  }));
  // Every figure in the findings and spotlights below is computed from
  // data.js at render time — no number is typed twice — so a dataset
  // change can never leave stale prose behind (review gap G6).
  const india = countryBySlug('india');
  const china = countryBySlug('china');
  const usa = countryBySlug('united-states');
  const bangladesh = countryBySlug('bangladesh');
  const japan = countryBySlug('japan');
  const lifeSorted = sortedBy('life');
  const longestLived = lifeSorted[0];
  const shortestLived = lifeSorted[lifeSorted.length - 1];
  const ppSorted = sortedBy('gdpPerPerson');
  const richest = ppSorted[0];
  const poorest = ppSorted[ppSorted.length - 1];
  const ppGap = Math.round(gdpPerPerson(richest) / gdpPerPerson(poorest));
  const indiaPp = gdpPerPerson(india);
  const usTimes = Math.round(gdpPerPerson(usa) / indiaPp);
  const indiaTie = Math.abs(indiaPp - gdpPerPerson(bangladesh)) <= 5
    ? 'almost exactly tied with' : 'close to';
  const findings = [
    {
      title: 'India has passed China',
      body: `India is now the most populous country on Earth — ${fmtPopFull(india.pop)} people in 2024, about ${Math.round((india.pop - china.pop) / 1e6)} million more than China (${fmtPopFull(china.pop)}). But China's economy is still roughly ${Math.round(china.gdp / india.gdp)} times India's: ${fmtGdp(china.gdp)} against ${fmtGdp(india.gdp)}.`,
    },
    {
      title: 'Twelve countries, most of the world',
      body: `These twelve hold ${fmtShare(totals.popShare)} of humanity (${fmtPop(totals.pop)}) and produce ${fmtShare(totals.gdpShare)} of world GDP (${fmtGdp(totals.gdp)}). Yet life expectancy across them still spans ${(longestLived.life - shortestLived.life).toFixed(1)} years — ${fmtLife(shortestLived.life)} in ${shortestLived.name}, ${fmtLife(longestLived.life)} in ${longestLived.name}.`,
    },
    {
      title: `${ppGap}× apart, per person`,
      body: `GDP per person runs from ${fmtPerPerson(gdpPerPerson(richest))} in the ${richest.name} to ${fmtPerPerson(gdpPerPerson(poorest))} in ${poorest.name} — a ${ppGap}-fold gap. Totals hide this: India has the world's ${ordinal(rankOf(india, 'gdp'))}-largest GDP and only its ${ordinal(rankOf(india, 'gdpPerPerson'))}-highest GDP per person.`,
    },
  ];
  return `
  <section class="hero">
    <p class="kicker">National statistics · World Bank WDI · verified 26 Nov 2026</p>
    <h1>The twelve countries where most of humanity lives.</h1>
    <p class="lede">StatAtlas tracks the world's twelve most populous countries across five
    indicators — population, GDP, GDP per person, life expectancy and unemployment —
    with every figure sourced, dated and ranked. Pick a country, rank them all, or
    put any two side by side.</p>
    <div class="world-strip">
      <div><strong>${fmtPop(WORLD.population)}</strong><span>people on Earth, 2024</span></div>
      <div><strong>${fmtGdp(WORLD.gdp)}</strong><span>world GDP, 2024</span></div>
      <div><strong>${fmtLife(WORLD.lifeExpectancy)}</strong><span>world life expectancy, 2023</span></div>
      <div><strong>12</strong><span>countries · 5 indicators · 60 figures</span></div>
    </div>
  </section>

  <section class="chart-section">
    ${sectionHead('All twelve, at a glance', 'Switch the indicator — the bars re-rank instantly. Click a country to open its profile.')}
    <div class="switcher" role="group" aria-label="Choose indicator">
      ${INDICATORS.map((ind, i) => `<button data-indicator="${ind.key}" class="${i === 0 ? 'active' : ''}">${ind.label} <small>${ind.year}</small></button>`).join('')}
    </div>
    <div id="overview-chart">${barChart(chartItems)}</div>
    <p class="chart-note">Source: World Bank WDI ${SOURCES.population.series} (population, 2024). GDP per person is GDP ÷ population, computed on this page.</p>
  </section>

  <section>
    ${sectionHead('Three things the numbers say', 'Each finding is computed from the figures above — check it on the Rankings page.')}
    <div class="cards">
      ${findings.map((f) => `<article class="card"><h3>${esc(f.title)}</h3><p>${f.body}</p></article>`).join('')}
    </div>
  </section>

  <section>
    ${sectionHead('Spotlights', 'Two countries worth a closer look.')}
    <div class="cards">
      <article class="card spotlight">
        <h3><a href="#/country/japan">Japan — the longest-lived</a></h3>
        <p>Life expectancy <strong>${fmtLife(japan.life)}</strong>, the highest of the twelve — ${(japan.life - WORLD.lifeExpectancy).toFixed(1)} years above the world average. Unemployment is <strong>${fmtUnemp(japan.unemp)}</strong>, ${ordinalWord(13 - rankOf(japan, 'unemp'))}-lowest of the twelve, in a country of ${fmtPop(japan.pop)} people with a ${fmtGdp(japan.gdp)} economy.</p>
        <p><a href="#/country/japan">Open Japan's profile →</a></p>
      </article>
      <article class="card spotlight">
        <h3><a href="#/country/india">India — the most people</a></h3>
        <p><strong>${fmtPop(india.pop)} people</strong>, the largest population on Earth, and the ${ordinal(rankOf(india, 'gdp'))}-largest economy at ${fmtGdp(india.gdp)}. But per person it is ${fmtPerPerson(indiaPp)} a year — ${indiaTie} Bangladesh (${fmtPerPerson(gdpPerPerson(bangladesh))}) and ${usTimes}× less than the United States.</p>
        <p><a href="#/country/india">Open India's profile →</a></p>
      </article>
    </div>
  </section>

  <section>
    ${sectionHead('How to read a statistic', 'Three habits that keep the numbers honest.')}
    <ol class="howto">
      <li><strong>Check the year.</strong> Population and GDP here are 2024; life expectancy is 2023, the latest the World Bank has published. A figure without a year is a rumour.</li>
      <li><strong>Totals lie; per person tells.</strong> ${china.name} outranks ${japan.name} on GDP and trails it ${(gdpPerPerson(japan) / gdpPerPerson(china)).toFixed(1)}-fold per person. Always ask which of the two you are looking at.</li>
      <li><strong>Modelled is not counted.</strong> The unemployment rates are ILO-modelled estimates, not census counts — good for comparing countries, not for quoting to one decimal as gospel.</li>
    </ol>
    <p class="cta-row"><a class="button" href="#/countries">Rank all twelve →</a> <a class="button ghost" href="#/compare">Compare two countries →</a></p>
  </section>`;
}

// --- Rankings ---------------------------------------------------------------

// Renders the table body only, so sorting and searching can re-render just
// the rows without rebuilding the whole page (and losing the search focus).
export function rankingsRows(countries, sortKey, descending) {
  const sorted = [...countries].sort((a, b) => {
    const va = indicatorValue(a, sortKey);
    const vb = indicatorValue(b, sortKey);
    return descending ? vb - va : va - vb;
  });
  return sorted.map((c) => `<tr>
    <td><a href="${profileLink(c)}">${esc(c.name)}</a></td>
    <td class="num">${fmtPopFull(c.pop)}</td>
    <td class="num">${fmtGdp(c.gdp)}</td>
    <td class="num">${fmtPerPerson(gdpPerPerson(c))}</td>
    <td class="num">${fmtLife(c.life)}</td>
    <td class="num">${fmtUnemp(c.unemp)}</td>
  </tr>`).join('');
}

export function renderRankings() {
  return `
  <section>
    <p class="kicker">Rankings · 12 countries · 5 indicators</p>
    <h1>Rankings: all twelve, all five indicators.</h1>
    <p class="lede">Click a column heading to sort by it — click again to reverse. Search
    filters by country name. Download the table as a CSV and the numbers travel with you.</p>
    <div class="table-tools">
      <label class="search">Search <input id="rank-search" type="search" placeholder="Search countries…" autocomplete="off"></label>
      <button id="csv-download" class="button">Download CSV</button>
    </div>
    <div class="table-wrap">
      <table id="rank-table">
        <thead><tr>
          <th data-sort="name" tabindex="0">Country</th>
          <th data-sort="pop" class="num sorted-desc" tabindex="0">Population · 2024</th>
          <th data-sort="gdp" class="num" tabindex="0">GDP · 2024</th>
          <th data-sort="gdpPerPerson" class="num" tabindex="0">GDP per person · 2024</th>
          <th data-sort="life" class="num" tabindex="0">Life expectancy · 2023</th>
          <th data-sort="unemp" class="num" tabindex="0">Unemployment · 2024</th>
        </tr></thead>
        <tbody id="rank-body">${rankingsRows(COUNTRIES, 'pop', true)}</tbody>
      </table>
    </div>
    <p id="rank-count" class="table-note">Showing 12 of 12 countries.</p>
    <p class="table-note">Population and GDP: World Bank WDI, 2024. Life expectancy: WDI, 2023.
    Unemployment: ILO-modelled, 2024. GDP per person is GDP ÷ population, computed here.
    Figures are shown rounded; the CSV carries the full values.</p>
    <p class="cta-row"><a class="button ghost" href="#/compare">Compare two countries →</a></p>
  </section>`;
}

// CSV for the download button: full unrounded values, one row per country.
export function rankingsCsv(countries) {
  const head = 'Country,Population 2024,GDP (current US$) 2024,GDP per person (US$) 2024,Life expectancy (years) 2023,Unemployment (% labour force) 2024';
  const rows = countries.map((c) => [c.name, c.pop, Math.round(c.gdp), gdpPerPerson(c), c.life, c.unemp].join(','));
  return [head, ...rows].join('\n') + '\n';
}

// --- Country profile ----------------------------------------------------------

// One plain-language paragraph, generated from the country's own ranks, so
// the text and the numbers can never disagree.
export function profileSummary(c) {
  const popRank = rankOf(c, 'pop');
  const gdpRank = rankOf(c, 'gdp');
  const ppRank = rankOf(c, 'gdpPerPerson');
  const lifeRank = rankOf(c, 'life');
  // Unemployment ranks run lowest-first: #1 is the lowest rate (Russia),
  // #12 the highest (Brazil). Every other rank here runs highest-first.
  const unempLow = 13 - rankOf(c, 'unemp');
  const popWord = popRank === 1 ? 'the most populous country on Earth' : `the ${ordinal(popRank)} most populous of the twelve`;
  const richWord = ppRank <= 3 ? 'among the richest per person' : ppRank >= 10 ? 'among the poorest per person of the twelve' : 'in the middle of the twelve per person';
  return `${c.name} is ${popWord}, with ${fmtPopFull(c.pop)} people in 2024 — ${fmtShare(shareOfWorld(c, 'pop'))} of humanity. ` +
    `Its economy is the ${ordinal(gdpRank)} largest of the twelve at ${fmtGdp(c.gdp)}, but per person it is ${richWord}: ${fmtPerPerson(gdpPerPerson(c))} a year, rank ${ppRank} of 12. ` +
    `People born there in 2023 could expect ${fmtLife(c.life)} — rank ${lifeRank} of 12, against a world average of ${fmtLife(WORLD.lifeExpectancy)}. ` +
    `Unemployment was ${fmtUnemp(c.unemp)} in 2024 (ILO-modelled), the ${ordinal(unempLow)} lowest rate of the twelve.`;
}

export function ordinal(n) {
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n] || 'th';
  return n + suffix;
}

export function renderProfile(slug) {
  const c = countryBySlug(slug);
  if (!c) {
    return `<section><h1>No such country.</h1>
      <p class="lede">StatAtlas covers the twelve most populous countries. Pick one from the list.</p>
      <p class="cta-row"><a class="button" href="#/countries">See the rankings →</a></p></section>`;
  }
  const others = COUNTRIES.filter((o) => o.slug !== c.slug);
  const lifeSorted = sortedBy('life');
  const longestLived = lifeSorted[0];
  const shortestLived = lifeSorted[lifeSorted.length - 1];
  return `
  <section>
    <p class="kicker"><a href="#/countries">Rankings</a> · ${esc(c.region)}</p>
    <h1>${esc(c.name)}</h1>
    <p class="lede">${profileSummary(c)}</p>
    <div class="stat-grid">
      <div class="stat-card"><span>Population · 2024</span><strong>${fmtPop(c.pop)}</strong><em>${fmtPopFull(c.pop)} people</em>${rankBadge(rankOf(c, 'pop'), 12, 'largest population')}</div>
      <div class="stat-card"><span>GDP · 2024</span><strong>${fmtGdp(c.gdp)}</strong><em>current US$</em>${rankBadge(rankOf(c, 'gdp'), 12, 'largest economy')}</div>
      <div class="stat-card"><span>GDP per person · 2024</span><strong>${fmtPerPerson(gdpPerPerson(c))}</strong><em>GDP ÷ population</em>${rankBadge(rankOf(c, 'gdpPerPerson'), 12, 'highest per person')}</div>
      <div class="stat-card"><span>Life expectancy · 2023</span><strong>${fmtLife(c.life)}</strong><em>at birth, WDI</em>${rankBadge(rankOf(c, 'life'), 12, 'longest-lived')}</div>
      <div class="stat-card"><span>Unemployment · 2024</span><strong>${fmtUnemp(c.unemp)}</strong><em>ILO-modelled</em>${rankBadge(13 - rankOf(c, 'unemp'), 12, 'lowest rate')}</div>
    </div>
    <div class="meters">
      ${shareMeter('Share of world population', shareOfWorld(c, 'pop'), fmtPop(c.pop))}
      ${shareMeter('Share of world GDP', shareOfWorld(c, 'gdp'), fmtGdp(c.gdp), '#b45309')}
    </div>
    <h2>Life expectancy in context</h2>
    ${lifeScale(c.life)}
    <p class="chart-note">The dot marks ${esc(c.name)} (${fmtLife(c.life)}); the tick marks the world average (${fmtLife(WORLD.lifeExpectancy)}). The twelve-country range runs ${fmtLife(shortestLived.life)} (${esc(shortestLived.name)}) to ${fmtLife(longestLived.life)} (${esc(longestLived.name)}).</p>
    <h2>All five ranks</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Indicator</th><th class="num">Value</th><th class="num">Rank of 12</th><th>Year</th></tr></thead>
      <tbody>
        <tr><td>Population</td><td class="num">${fmtPopFull(c.pop)}</td><td class="num">#${rankOf(c, 'pop')}</td><td>2024</td></tr>
        <tr><td>GDP</td><td class="num">${fmtGdp(c.gdp)}</td><td class="num">#${rankOf(c, 'gdp')}</td><td>2024</td></tr>
        <tr><td>GDP per person</td><td class="num">${fmtPerPerson(gdpPerPerson(c))}</td><td class="num">#${rankOf(c, 'gdpPerPerson')}</td><td>2024</td></tr>
        <tr><td>Life expectancy</td><td class="num">${fmtLife(c.life)}</td><td class="num">#${rankOf(c, 'life')}</td><td>2023</td></tr>
        <tr><td>Unemployment</td><td class="num">${fmtUnemp(c.unemp)}</td><td class="num">#${13 - rankOf(c, 'unemp')}</td><td>2024</td></tr>
      </tbody>
    </table></div>
    <p class="table-note">Ranks run highest-first — #1 is the largest population, the biggest economy, the longest life — except unemployment, where #1 is the lowest rate.</p>
    <p class="cta-row">
      <a class="button" href="#/compare?a=${c.slug}&amp;b=${others[0].slug}">Compare ${esc(c.name)} with ${esc(others[0].name)} →</a>
      <a class="button ghost" href="#/countries">← Back to rankings</a>
    </p>
  </section>`;
}

// --- Compare ------------------------------------------------------------------

export function compareVerdict(a, b) {
  const popRatio = a.pop / b.pop;
  const gdpRatio = a.gdp / b.gdp;
  const ppRatio = gdpPerPerson(a) / gdpPerPerson(b);
  const lifeGap = a.life - b.life;
  const bigger = popRatio >= 1 ? a : b;
  const smaller = popRatio >= 1 ? b : a;
  const ratio = popRatio >= 1 ? popRatio : 1 / popRatio;
  const richer = ppRatio >= 1 ? a : b;
  const poorer = ppRatio >= 1 ? b : a;
  const ppTimes = ppRatio >= 1 ? ppRatio : 1 / ppRatio;
  const gdpTimes = gdpRatio >= 1 ? gdpRatio : 1 / gdpRatio;
  const gdpWord = gdpRatio >= 1 ? 'larger' : 'smaller';
  const longer = lifeGap >= 0 ? a : b;
  return `${bigger.name} has ${fmtRatio(ratio)}× the population of ${smaller.name} ` +
    `(${fmtPop(bigger.pop)} vs ${fmtPop(smaller.pop)}), and a ${fmtRatio(gdpTimes)}× ${gdpWord} economy — ` +
    `but ${richer.name} is ${fmtRatio(ppTimes)}× richer per person (${fmtPerPerson(gdpPerPerson(richer))} vs ${fmtPerPerson(gdpPerPerson(poorer))}). ` +
    `People in ${longer.name} live ${Math.abs(lifeGap).toFixed(1)} years longer on average.`;
}

// The pickers, shared by the normal compare page and the two error states
// below — main.js wires them by id, so every branch must include them.
function comparePickers(a, b) {
  const options = (selected) => COUNTRIES.map((c) => `<option value="${c.slug}" ${c.slug === selected ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  return `<div class="compare-pickers">
      <label>Country A <select id="compare-a">${options(a.slug)}</select></label>
      <button id="compare-swap" class="button ghost" type="button">⇄ Swap</button>
      <label>Country B <select id="compare-b">${options(b.slug)}</select></label>
    </div>`;
}

export function renderCompare(aSlug, bSlug) {
  const aRaw = countryBySlug(aSlug);
  const bRaw = countryBySlug(bSlug);
  // A slug that was given but matches no country is an error, not a silent
  // fallback: a shared or mistyped link must never show the wrong pair.
  // A missing slug (no ?a= / ?b=) just defaults to India / China.
  const bad = [];
  if (aSlug && !aRaw) bad.push(aSlug);
  if (bSlug && !bRaw) bad.push(bSlug);
  const a = aRaw ?? COUNTRIES[0];
  const b = bRaw ?? COUNTRIES[1];
  if (bad.length) {
    return `
  <section>
    <p class="kicker">Compare · any two of the twelve</p>
    <h1>No such countr${bad.length > 1 ? 'ies' : 'y'}.</h1>
    <p class="lede">StatAtlas covers the twelve most populous countries, and ${bad.map((s) => `“${esc(s)}”`).join(' and ')} ${bad.length > 1 ? 'are' : 'is'} not one of them. Pick two countries below.</p>
    ${comparePickers(a, b)}
    <p class="cta-row"><a class="button" href="#/countries">See the rankings →</a></p>
  </section>`;
  }
  // Comparing a country with itself has no verdict to give.
  if (a.slug === b.slug) {
    return `
  <section>
    <p class="kicker">Compare · any two of the twelve</p>
    <h1>${esc(a.name)} vs ${esc(a.name)}</h1>
    <p class="lede">Comparing a country with itself tells you nothing — pick two different countries below.</p>
    ${comparePickers(a, b)}
    <p class="cta-row"><a class="button ghost" href="#/country/${a.slug}">Profile: ${esc(a.name)} →</a></p>
  </section>`;
  }
  const rows = INDICATORS.map((ind) => {
    const va = indicatorValue(a, ind.key);
    const vb = indicatorValue(b, ind.key);
    const winner = va === vb ? null : (ind.key === 'unemp' ? (va < vb ? 'a' : 'b') : (va > vb ? 'a' : 'b'));
    return `<tr><td>${ind.label} · ${ind.year}</td>
      <td class="num ${winner === 'a' ? 'winner' : ''}">${ind.full(va)}</td>
      <td class="num ${winner === 'b' ? 'winner' : ''}">${ind.full(vb)}</td></tr>`;
  }).join('');
  return `
  <section>
    <p class="kicker">Compare · any two of the twelve</p>
    <h1>${esc(a.name)} vs ${esc(b.name)}</h1>
    <p class="lede">${compareVerdict(a, b)}</p>
    ${comparePickers(a, b)}
    <div class="table-wrap"><table>
      <thead><tr><th>Indicator</th><th class="num">${esc(a.name)}</th><th class="num">${esc(b.name)}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="table-note">Bold marks the "more" of each row — except unemployment, where the lower rate is bolded. GDP per person is GDP ÷ population.</p>
    <h2>Population, side by side</h2>
    ${barChart([
      { label: a.name, value: a.pop, display: fmtPop(a.pop), href: profileLink(a) },
      { label: b.name, value: b.pop, display: fmtPop(b.pop), href: profileLink(b) },
    ], { maxValue: Math.max(a.pop, b.pop) })}
    <p class="chart-note">For scale: the twelve together hold ${fmtPop(twelveTotals().pop)} people, ${fmtShare(twelveTotals().popShare)} of the world.</p>
    <p class="cta-row"><a class="button ghost" href="#/country/${a.slug}">Profile: ${esc(a.name)} →</a> <a class="button ghost" href="#/country/${b.slug}">Profile: ${esc(b.name)} →</a></p>
  </section>`;
}

// --- Methodology ---------------------------------------------------------------

export function renderMethodology() {
  const totals = twelveTotals();
  // The country list and shares are computed from the dataset, never typed
  // out — the list is the twelve by population, in that order.
  const names = sortedBy('pop').map((c) => c.name);
  const countryList = names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  const rows = [
    { series: SOURCES.population.series, name: 'Population, total', year: 2024, note: 'Mid-year estimate of all residents, regardless of legal status or citizenship.' },
    { series: SOURCES.gdp.series, name: 'GDP (current US$)', year: 2024, note: 'Gross domestic product at market prices, converted to US dollars at the official exchange rate.' },
    { series: 'derived', name: 'GDP per person', year: 2024, note: 'Not a published series: GDP divided by population, computed on this page and rounded to whole dollars.' },
    { series: SOURCES.life.series, name: 'Life expectancy at birth, total (years)', year: 2023, note: 'Years a newborn would live if current mortality patterns held. 2023 is the latest year the World Bank has published.' },
    { series: SOURCES.unemployment.series, name: 'Unemployment, total (% of total labour force)', year: 2024, note: 'ILO-modelled estimate: the share of the labour force without work but available for and seeking employment.' },
  ];
  return `
  <section>
    <p class="kicker">Methodology · sources, years, limits</p>
    <h1>Where every number comes from.</h1>
    <p class="lede">All five indicators come from one publisher — the World Bank's World
    Development Indicators (WDI) — retrieved from its public API on ${SOURCES.retrieved}.
    One figure on this site is derived, not published: GDP per person, which is GDP
    divided by population. Everything else is stored exactly as the API returned it.</p>
    <h2>The five series</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Series</th><th>Indicator</th><th class="num">Year</th><th>Definition</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td><code>${r.series}</code></td><td>${esc(r.name)}</td><td class="num">${r.year}</td><td>${esc(r.note)}</td></tr>`).join('')}</tbody>
    </table></div>
    <h2>Why these twelve countries</h2>
    <p>The twelve most populous countries in the world in 2024: ${esc(countryList)}.
    Together they hold ${fmtShare(totals.popShare)} of humanity and produce ${fmtShare(totals.gdpShare)} of world GDP — a single list
    that is big enough to rank meaningfully and small enough to read in one sitting.</p>
    <h2>Rounding and limits</h2>
    <ul class="limits">
      <li>Populations are shown to two decimals in billions (1.45bn) and in full in tables and the CSV. GDP is shown to two decimals in trillions.</li>
      <li>Life expectancy and unemployment are shown to one decimal. Unemployment is an ILO-modelled estimate — use it to compare countries, not as a census count.</li>
      <li>World totals are the World Bank's own WLD aggregates, not the sum of the twelve: population 8,140,897,523 (2024), GDP $111,669,432,109,121 (2024), life expectancy 73.33 years (2023).</li>
      <li>The World Bank revises its series. If a figure here differs from a newer WDI release, the newer release wins — this snapshot is dated ${SOURCES.retrieved}.</li>
    </ul>
    <h2>Cite this site</h2>
    <p class="citation">StatAtlas — 12 countries × 5 indicators. Data: World Bank, World Development
    Indicators (SP.POP.TOTL; NY.GDP.MKTP.CD; SP.DYN.LE00.IN; SL.UEM.TOTL.ZS), retrieved
    26 November 2026. GDP per person derived as GDP ÷ population. Figures shown rounded;
    the Rankings CSV carries full values.</p>
    <p class="cta-row"><a class="button" href="#/countries">Back to the rankings →</a></p>
  </section>`;
}
