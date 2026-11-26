// StatAtlas data — the twelve most populous countries on Earth, five
// indicators each. Every figure was read from the World Bank's public API
// (api.worldbank.org, WDI series, dataset last updated 2026-11-11) on
// 26 November 2026 and is stored here exactly as the API returned it.
// Population and GDP are 2024; life expectancy is 2023 (the latest WDI
// year at retrieval); unemployment is the 2024 ILO-modelled estimate.
// GDP per person is NOT stored — it is derived in code (GDP / population),
// so the two source numbers and the derived one can never disagree.

export const WORLD = {
  // World Bank WDI, code WLD. Population and GDP 2024, life expectancy 2023.
  population: 8140897523,
  gdp: 111669432109121,
  lifeExpectancy: 73.33,
};

export const SOURCES = {
  retrieved: '2026-11-26',
  population: { series: 'SP.POP.TOTL', name: 'Population, total', year: 2024, publisher: 'World Bank, World Development Indicators' },
  gdp: { series: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)', year: 2024, publisher: 'World Bank, World Development Indicators' },
  life: { series: 'SP.DYN.LE00.IN', name: 'Life expectancy at birth, total (years)', year: 2023, publisher: 'World Bank, World Development Indicators' },
  unemployment: { series: 'SL.UEM.TOTL.ZS', name: 'Unemployment, total (% of total labor force) (modeled ILO estimate)', year: 2024, publisher: 'World Bank, World Development Indicators (ILO)' },
};

// One row per country. pop: people. gdp: current US dollars. life: years.
// unemp: percent of the labour force. region: for the profile page only.
export const COUNTRIES = [
  { slug: 'india', name: 'India', region: 'South Asia', pop: 1450935791, gdp: 3760813470501, life: 72.003, unemp: 4.173 },
  { slug: 'china', name: 'China', region: 'East Asia', pop: 1408975000, gdp: 18729668435848, life: 77.953, unemp: 4.59 },
  { slug: 'united-states', name: 'United States', region: 'North America', pop: 340003797, gdp: 29298013000000, life: 78.385, unemp: 4.022 },
  { slug: 'indonesia', name: 'Indonesia', region: 'Southeast Asia', pop: 283487931, gdp: 1396301788462, life: 71.146, unemp: 3.301 },
  { slug: 'pakistan', name: 'Pakistan', region: 'South Asia', pop: 251269164, gdp: 371747087751, life: 67.649, unemp: 5.492 },
  { slug: 'nigeria', name: 'Nigeria', region: 'West Africa', pop: 232679478, gdp: 252261880140, life: 54.462, unemp: 3.045 },
  { slug: 'brazil', name: 'Brazil', region: 'South America', pop: 211998573, gdp: 2185821610689, life: 75.848, unemp: 6.801 },
  { slug: 'bangladesh', name: 'Bangladesh', region: 'South Asia', pop: 173562364, gdp: 450119432069, life: 74.672, unemp: 3.635 },
  { slug: 'russia', name: 'Russia', region: 'Europe', pop: 143669648, gdp: 2186462268813, life: 73.255, unemp: 2.43 },
  { slug: 'ethiopia', name: 'Ethiopia', region: 'East Africa', pop: 132059767, gdp: 149740297952, life: 67.315, unemp: 3.357 },
  { slug: 'mexico', name: 'Mexico', region: 'North America', pop: 130861007, gdp: 1830489311089, life: 75.069, unemp: 2.678 },
  { slug: 'japan', name: 'Japan', region: 'East Asia', pop: 123975371, gdp: 4190008188359, life: 84.041, unemp: 2.5 },
];

// --- Derived figures (computed here, in one place, from the stored data) ---

// GDP per person, current US$ (GDP divided by population, rounded to dollars).
export function gdpPerPerson(country) {
  return Math.round(country.gdp / country.pop);
}

// Rank of one country (1 = highest) on any stored or derived indicator.
// For unemployment, "highest" means the highest rate; the profile page
// flips the wording so rank 1 there reads as the lowest rate.
export function rankOf(country, key) {
  const value = key === 'gdpPerPerson' ? gdpPerPerson(country) : country[key];
  return COUNTRIES.filter((c) => {
    const other = key === 'gdpPerPerson' ? gdpPerPerson(c) : c[key];
    return other > value;
  }).length + 1;
}

// Share of a world total, as a fraction (0..1). The dataset stores country
// values under short keys (pop, gdp) while WORLD uses the full names, so
// the keys are mapped here — a bare WORLD[key] would silently be undefined.
const WORLD_KEY = { pop: 'population', gdp: 'gdp', life: 'lifeExpectancy' };
export function shareOfWorld(country, key) {
  return country[key] / WORLD[WORLD_KEY[key] ?? key];
}

// The twelve countries together, against the world.
export function twelveTotals() {
  const pop = COUNTRIES.reduce((sum, c) => sum + c.pop, 0);
  const gdp = COUNTRIES.reduce((sum, c) => sum + c.gdp, 0);
  return {
    pop,
    gdp,
    popShare: pop / WORLD.population,
    gdpShare: gdp / WORLD.gdp,
  };
}

export function countryBySlug(slug) {
  return COUNTRIES.find((c) => c.slug === slug) || null;
}

// Sorted copy of the countries by one indicator, highest first.
export function sortedBy(key, descending = true) {
  const valueOf = (c) => (key === 'gdpPerPerson' ? gdpPerPerson(c) : c[key]);
  return [...COUNTRIES].sort((a, b) => (descending ? valueOf(b) - valueOf(a) : valueOf(a) - valueOf(b)));
}
