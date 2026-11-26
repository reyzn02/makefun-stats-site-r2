// StatAtlas charts — hand-drawn SVG, no library, no images. Every chart is
// built from the data at render time, so a wrong number would show up as a
// wrong bar, not as a stale picture.

// Escape text that goes into an SVG label. All labels here come from our
// own data file, but escaping keeps the chart builder honest.
export function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// A horizontal bar chart: one labelled bar per row, longest bar fills the
// track. items: [{ label, value, display, href? }]. value is the raw number
// the bars are scaled by; display is the text shown at the bar's end.
export function barChart(items, { maxValue = null, barColor = '#0f766e', height = 30 } = {}) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value));
  const labelWidth = 132;
  const chartWidth = 560;
  const rowHeight = height;
  const totalHeight = items.length * rowHeight + 8;
  const rows = items.map((item, i) => {
    const width = Math.max(2, (item.value / max) * chartWidth);
    const y = 8 + i * rowHeight;
    const bar = `<rect x="${labelWidth}" y="${y + 4}" width="${width.toFixed(1)}" height="18" rx="3" fill="${barColor}" />`;
    const label = `<text x="${labelWidth - 10}" y="${y + 18}" text-anchor="end" font-size="13" fill="#1f2937">${esc(item.label)}</text>`;
    const value = `<text x="${labelWidth + width + 8}" y="${y + 18}" font-size="13" font-weight="600" fill="#111827">${esc(item.display)}</text>`;
    const inner = item.href
      ? `<a href="${esc(item.href)}">${bar}${label}${value}</a>`
      : bar + label + value;
    return inner;
  }).join('');
  return `<svg viewBox="0 0 760 ${totalHeight}" width="100%" role="img" aria-label="Bar chart" xmlns="http://www.w3.org/2000/svg">${rows}</svg>`;
}

// A share-of-world meter: a track with a filled portion and a percent label.
// Used on country profiles to show how much of the world one country is.
export function shareMeter(label, share, display, color = '#0f766e') {
  const pct = (share * 100).toFixed(1);
  const width = Math.max(0.6, share * 100);
  return `<div class="meter">
    <div class="meter-head"><span>${esc(label)}</span><strong>${esc(display)} · ${pct}% of the world</strong></div>
    <div class="meter-track"><div class="meter-fill" style="width:${width.toFixed(1)}%;background:${color}"></div></div>
  </div>`;
}

// Life expectancy in context: the country's value against the world average
// (73.3 years) and the twelve-country range (54.5–84.0), as dots on a line.
// Labels sit above the line; when the country's dot is almost on top of the
// world's (Russia: 73.3 vs 73.3), its label drops below the line instead of
// printing over the world's. A label near the right edge pins to the edge
// rather than running off the page.
export function lifeScale(countryLife, worldLife = 73.33) {
  const lo = 50;
  const hi = 86;
  const x = (v) => ((v - lo) / (hi - lo)) * 100;
  const wx = x(worldLife);
  const cx = x(countryLife);
  const crowded = Math.abs(cx - wx) < 7;
  const pin = (value) => (value > 85
    ? 'style="left:auto;right:0"'
    : value < 8
      ? 'style="left:0;transform:none"'
      : `style="left:${value.toFixed(1)}%"`);
  return `<div class="lifescale" role="img" aria-label="Life expectancy ${countryLife} years, world average ${worldLife} years">
    <div class="lifescale-line"></div>
    <span class="lifescale-dot" style="left:${wx.toFixed(1)}%"></span>
    <span class="lifescale-dot you" style="left:${cx.toFixed(1)}%"></span>
    <span class="lifescale-label" ${pin(wx)}>World ${worldLife.toFixed(1)} yrs</span>
    <span class="lifescale-label you${crowded ? ' below' : ''}" ${pin(cx)}>${countryLife.toFixed(1)} yrs</span>
    <span class="lifescale-end" style="left:0">50</span>
    <span class="lifescale-end" style="right:0">86 yrs</span>
  </div>`;
}

// A compact rank badge: "#3 of 12" with the indicator name underneath.
export function rankBadge(rank, of, caption) {
  return `<div class="rank-badge"><strong>#${rank}</strong><span>of ${of}</span><em>${esc(caption)}</em></div>`;
}
