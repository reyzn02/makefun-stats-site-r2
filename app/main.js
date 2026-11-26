// StatAtlas main — hash router and page wiring. No framework: the router
// reads location.hash, asks views.js for the page, and wires up that page's
// controls. Every link in the site is a plain hash link, so the back button
// and bookmarks work without any server.

import { COUNTRIES, sortedBy } from './data.js';
import { barChart } from './charts.js';
import {
  INDICATORS, fmtPop, renderOverview, renderRankings, renderProfile,
  renderCompare, renderMethodology, rankingsRows, rankingsCsv,
} from './views.js';

const app = document.getElementById('app');

// Parse "#/country/japan" into { page: 'country', arg: 'japan' } and
// "#/compare?a=india&b=japan" into { page: 'compare', params: {...} }.
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  return { page: parts[0] || 'overview', arg: parts[1] || null, params: new URLSearchParams(query || '') };
}

function setActiveNav(page) {
  document.querySelectorAll('.nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function render() {
  const { page, arg, params } = parseHash();
  setActiveNav(page);
  if (page === 'countries') {
    app.innerHTML = renderRankings();
    wireRankings();
  } else if (page === 'country') {
    app.innerHTML = renderProfile(arg);
  } else if (page === 'compare') {
    app.innerHTML = renderCompare(params.get('a'), params.get('b'));
    wireCompare();
  } else if (page === 'methodology') {
    app.innerHTML = renderMethodology();
  } else {
    app.innerHTML = renderOverview();
    wireOverview();
  }
  window.scrollTo(0, 0);
}

// Overview: the indicator switcher re-draws the bar chart in place.
function wireOverview() {
  const chart = document.getElementById('overview-chart');
  document.querySelectorAll('.switcher button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.switcher button').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      const ind = INDICATORS.find((i) => i.key === button.dataset.indicator);
      const items = sortedBy(ind.key).map((c) => {
        const value = ind.key === 'gdpPerPerson' ? Math.round(c.gdp / c.pop) : c[ind.key];
        return { label: c.name, value, display: ind.format(value), href: `#/country/${c.slug}` };
      });
      chart.innerHTML = barChart(items);
      document.querySelector('.chart-note').textContent =
        `Source: World Bank WDI ${ind.key === 'life' ? 'SP.DYN.LE00.IN' : ind.key === 'unemp' ? 'SL.UEM.TOTL.ZS' : ind.key === 'gdp' || ind.key === 'gdpPerPerson' ? 'NY.GDP.MKTP.CD' : 'SP.POP.TOTL'} (${ind.label}, ${ind.year}).` +
        (ind.key === 'gdpPerPerson' ? ' GDP per person is GDP ÷ population, computed on this page.' : '');
    });
  });
}

// Rankings: column sorting, live search, CSV download.
function wireRankings() {
  const body = document.getElementById('rank-body');
  const search = document.getElementById('rank-search');
  const headers = [...document.querySelectorAll('#rank-table th[data-sort]')];
  let sortKey = 'pop';
  let descending = true;

  function visible() {
    const q = search.value.trim().toLowerCase();
    return q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
  }

  function redraw() {
    const shown = visible();
    body.innerHTML = rankingsRows(shown, sortKey, descending);
    document.getElementById('rank-count').textContent =
      `Showing ${shown.length} of ${COUNTRIES.length} countries.`;
    headers.forEach((h) => {
      h.classList.remove('sorted-asc', 'sorted-desc');
      if (h.dataset.sort === sortKey) h.classList.add(descending ? 'sorted-desc' : 'sorted-asc');
    });
  }

  function sortBy(header) {
    if (header.dataset.sort === sortKey) {
      descending = !descending;
    } else {
      sortKey = header.dataset.sort;
      descending = sortKey !== 'name';
    }
    redraw();
  }

  headers.forEach((h) => {
    h.addEventListener('click', () => sortBy(h));
    // Keyboard users can sort too: Enter or Space on a focused heading.
    h.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        sortBy(h);
      }
    });
  });
  search.addEventListener('input', redraw);
  document.getElementById('csv-download').addEventListener('click', () => {
    const blob = new Blob([rankingsCsv(visible())], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statatlas-rankings-2024.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Compare: the two selects and the swap button rewrite the hash, which
// re-renders the page — so a comparison is always a shareable link.
function wireCompare() {
  const selectA = document.getElementById('compare-a');
  const selectB = document.getElementById('compare-b');
  const go = () => {
    location.hash = `#/compare?a=${selectA.value}&b=${selectB.value}`;
  };
  selectA.addEventListener('change', go);
  selectB.addEventListener('change', go);
  document.getElementById('compare-swap').addEventListener('click', () => {
    location.hash = `#/compare?a=${selectB.value}&b=${selectA.value}`;
  });
}

window.addEventListener('hashchange', render);
render();
