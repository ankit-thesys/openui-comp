// Test-only extension for an existing Playwright page. No browser/server/build ownership.
export const sharedTargets = [
  'openui-chart-empty-root', 'openui-chart-y-axis-label-root', 'openui-chart-x-axis-label-root',
  'openui-mini-chart-root', 'openui-chart-default-legend-root', 'openui-chart-tooltip-portal-root',
  'openui-chart-tooltip-root', 'openui-chart-stacked-legend-root', 'openui-chart-stacked-legend-layout-root',
  'openui-chart-stacked-legend-scrollbar', 'openui-chart-horizontal-scroll-controls-root', 'openui-chart-vertical-scroll-controls-root',
];

/** Can also run in the fixture entry before/after its public package import. */
export function sharedHostSnapshotInPage() {
  return [...document.querySelectorAll('[data-chart-shared-host], [data-chart-shared-host] *')].map(e => {
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    const props = ['display', 'position', 'boxSizing', 'color', 'backgroundColor', 'fontSize', 'lineHeight', 'padding', 'gap', 'borderRadius', 'cursor', 'visibility', 'pointerEvents', 'fill', 'stroke', 'strokeWidth'];
    return { tag: e.tagName, className: e.getAttribute('class'), styles: Object.fromEntries(props.map(k => [k, s[k]])), size: [r.width, r.height] };
  });
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const finite = document.getAnimations().filter(a => a.effect && a.effect.getTiming().iterations !== Infinity && Number(a.effect.getTiming().duration) < 2000);
    await Promise.all(finite.map(a => a.finished.catch(() => {})));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

async function snapshot(page, selector) {
  return page.locator(selector).evaluate(root => {
    const props = ['display', 'position', 'boxSizing', 'width', 'height', 'minWidth', 'minHeight', 'color', 'backgroundColor', 'fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'padding', 'gap', 'borderRadius', 'overflowX', 'overflowY', 'cursor', 'visibility', 'opacity', 'pointerEvents', 'zIndex', 'fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'animationName', 'animationDuration', 'animationFillMode', 'transformOrigin'];
    return [root, ...root.querySelectorAll('*')].map(e => {
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      return { tag: e.tagName, role: e.getAttribute('role'), text: e.childElementCount ? null : e.textContent, styles: Object.fromEntries(props.map(k => [k, s[k]])), size: [r.width, r.height], geometry: Object.fromEntries(['d', 'x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'viewBox', 'fill', 'stroke'].filter(k => e.hasAttribute(k)).map(k => [k, e.getAttribute(k)])) };
    });
  });
}

/** No IDs, fixture ancestors, important declarations or private Goober names in consumer CSS. */
async function ownedOverride(page, { target, cssSelector, property, value, expected = value, pseudo = null }) {
  const el = target.first();
  const count = await target.count();
  if (!count) return { pass: false, cssSelector, property, error: 'No actual target', count };
  const before = await el.evaluate((e, { cssSelector, property, pseudo }) => {
    const elementSelector = pseudo ? cssSelector.slice(0, -pseudo.length) : cssSelector;
    const matched = e.matches(elementSelector), rules = [];
    function visit(list, conditions = []) {
      for (const rule of list) {
        const condition = rule.conditionText;
        let active = true;
        if (rule.constructor.name === 'CSSMediaRule') active = matchMedia(condition).matches;
        if (rule.constructor.name === 'CSSSupportsRule') active = CSS.supports(condition);
        if (!active) continue;
        if (rule.selectorText && rule.style?.getPropertyValue(property)) {
          const selector = pseudo && rule.selectorText.endsWith(pseudo) ? rule.selectorText.slice(0, -pseudo.length) : rule.selectorText;
          let match = false;
          try { match = e.matches(selector); } catch { /* A different pseudo-element cannot match this target. */ }
          if (match && (!pseudo || rule.selectorText.endsWith(pseudo))) rules.push({ selector: rule.selectorText, value: rule.style.getPropertyValue(property), priority: rule.style.getPropertyPriority(property), conditions });
        }
        if (rule.cssRules) visit(rule.cssRules, condition ? [...conditions, condition] : conditions);
      }
    }
    for (const sheet of document.styleSheets) { try { visit(sheet.cssRules); } catch { /* Cross-origin sheets are not read. */ } }
    return { matched, inlineValue: e.style.getPropertyValue(property), actual: getComputedStyle(e, pseudo).getPropertyValue(property), rules };
  }, { cssSelector, property, pseudo });
  const owner = sharedTargets.find(h => cssSelector.includes('.' + h));
  before.ownedRules = before.rules.filter(rule => owner && rule.selector.includes('.' + owner));
  if (!before.matched || !before.ownedRules.length || (!pseudo && before.inlineValue) || before.actual === expected) {
    return { pass: false, cssSelector, property, count, before, error: 'Probe must match an actual owned non-inline declaration and change its value' };
  }
  const style = await page.addStyleTag({ content: `${cssSelector}{${property}:${value}}` });
  try {
    await settle(page);
    const actual = await el.evaluate((e, { property, pseudo }) => getComputedStyle(e, pseudo).getPropertyValue(property), { property, pseudo });
    return { pass: actual === expected, cssSelector, property, count, before, wanted: value, expected, actual, pseudo };
  } finally {
    await style.evaluate(e => e.remove());
    await settle(page);
  }
}

export async function runSharedChartProbes(page, { arm, theme = 'nested', config = {} }) {
  const checks = [], observations = {}, observed = new Set();
  const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
  const scene = name => page.locator(`[data-shared-chart-scene="${name}"]`);
  async function collect() {
    const counts = await page.evaluate(targets => Object.fromEntries(targets.map(h => [h, [...document.querySelectorAll('.' + h)].filter(e => !e.closest('[data-chart-shared-host]')).length])), sharedTargets);
    for (const [h, count] of Object.entries(counts)) if (count) observed.add(h);
    return counts;
  }
  async function probe(name, options) {
    if (arm !== 'candidate') return;
    const result = await ownedOverride(page, options);
    check(name, result.pass, result);
  }
  try {
    await page.waitForSelector('[data-shared-chart-scene="condensed"] .openui-bar-chart-bar');
    await page.waitForSelector('[data-shared-chart-scene="mini"] .openui-mini-line-chart-line');
    await page.waitForSelector('[data-shared-chart-scene="standalone-legend"] .openui-stacked-legend__item');
    await page.mouse.move(0, 0);
    await settle(page);
    observations.default = await snapshot(page, '[data-shared-chart-probes]');
    observations.initialHookCounts = await collect();
    if (arm === 'baseline') check('canonical hooks absent in unchanged baseline', Object.values(observations.initialHookCounts).every(n => n === 0), observations.initialHookCounts);

    await probe('empty owned min-height', { target: scene('empty').locator('.openui-chart-empty-root'), cssSelector: '.openui-chart-empty-root', property: 'min-height', value: '241px' });
    await probe('condensed y label owned color', { target: scene('condensed').locator('.openui-chart-y-axis-label-root'), cssSelector: '.openui-chart-y-axis-label-root', property: 'color', value: 'rgb(71, 72, 73)' });
    await probe('condensed x label owned alignment', { target: scene('condensed').locator('.openui-chart-x-axis-label-root'), cssSelector: '.openui-chart-x-axis-label-root', property: 'text-align', value: 'left' });
    await probe('mini owned minimum size', { target: scene('mini').locator('.openui-mini-chart-root'), cssSelector: '.openui-mini-chart-root', property: 'min-width', value: '123px' });
    await probe('mini SVG point owned fill', { target: scene('mini').locator('.openui-mini-line-chart-point'), cssSelector: '.openui-mini-chart-root :where(.openui-mini-line-chart-point)', property: 'fill', value: 'rgb(61, 62, 63)' });
    await probe('default legend owned gap', { target: scene('condensed').locator('.openui-chart-default-legend-root'), cssSelector: '.openui-chart-default-legend-root', property: 'gap', value: '17px' });
    await probe('legend part matching color', { target: scene('condensed').locator('.openui-chart-legend-item-label'), cssSelector: '.openui-chart-default-legend-root :where(.openui-chart-legend-item-label)', property: 'color', value: 'rgb(71, 72, 73)' });

    const bar = scene('condensed').locator('.openui-bar-chart-bar').first();
    await bar.scrollIntoViewIfNeeded();
    await bar.hover();
    const portal = page.locator('body > .openui-portal-tooltip');
    await portal.waitFor({ state: 'visible' });
    await page.waitForFunction(() => { const e = document.querySelector('body > .openui-portal-tooltip'); return e && getComputedStyle(e).opacity === '1'; });
    await settle(page);
    observations.tooltip = await snapshot(page, 'body > .openui-portal-tooltip');
    observations.tooltipHookCounts = await collect();
    check('tooltip is real body portal outside chart scene', await portal.evaluate(e => e.parentElement === document.body && !e.closest('[data-shared-chart-probes]')));
    check('tooltip retains pointer-events none', await portal.evaluate(e => getComputedStyle(e).pointerEvents === 'none'));
    const expectedColor = theme === 'dark' ? 'rgb(211, 212, 213)' : 'rgb(31, 32, 33)';
    check('real tooltip inherits nearest theme text', await portal.locator('.openui-chart-tooltip-label').evaluate(e => getComputedStyle(e).color) === expectedColor, { theme, expectedColor });
    check('tooltip >10 items renders five actual items', await portal.locator('.openui-chart-tooltip-content-item').count() === 5);
    check('tooltip view-more branch is present', await portal.locator('.openui-chart-tooltip-content-view-more').count() === 1);
    await probe('portal owned z-index', { target: portal, cssSelector: '.openui-chart-tooltip-portal-root', property: 'z-index', value: '1057' });
    await probe('tooltip panel owned radius', { target: portal.locator('.openui-chart-tooltip'), cssSelector: '.openui-chart-tooltip-root', property: 'border-radius', value: '19px' });
    await probe('tooltip part owned color', { target: portal.locator('.openui-chart-tooltip-label'), cssSelector: '.openui-chart-tooltip-root :where(.openui-chart-tooltip-label)', property: 'color', value: 'rgb(71, 72, 73)' });
    await page.mouse.move(0, 0);
    await portal.waitFor({ state: 'detached' });

    const legend = scene('condensed').locator('.openui-chart-legend-container');
    const toggle = legend.locator('.openui-chart-legend-toggle-button');
    const collapsedCount = await legend.locator('.openui-chart-legend-item').count();
    check('default legend genuine collapse affordance', await toggle.count() === 1 && collapsedCount < 12, { collapsedCount });
    await toggle.click(); await settle(page);
    check('default legend expands all twelve series', await legend.locator('.openui-chart-legend-item').count() === 12);
    const item = legend.locator('.openui-chart-legend-item').first();
    const originalBarCount = await scene('condensed').locator('.openui-bar-chart-bar').count();
    const swatchBefore = await item.locator('.openui-chart-legend-item-indicator').evaluate(e => getComputedStyle(e).backgroundColor);
    await item.click(); await settle(page);
    check('default legend hides a real series', await item.evaluate(e => getComputedStyle(e).opacity === '0.3'));
    check('legend toggles actual plotted series', await scene('condensed').locator('.openui-bar-chart-bar').count() < originalBarCount, { originalBarCount });
    check('legend palette identity survives hide', await item.locator('.openui-chart-legend-item-indicator').evaluate(e => getComputedStyle(e).backgroundColor) === swatchBefore);
    await item.click(); await settle(page);
    check('default legend restores series opacity', await item.evaluate(e => getComputedStyle(e).opacity === '1'));
    check('default legend restores plotted series', await scene('condensed').locator('.openui-bar-chart-bar').count() === originalBarCount);
    await toggle.click(); await settle(page);

    const mini = scene('mini').locator('.openui-mini-chart--clickable');
    await mini.click();
    check('mini actual callback', (await scene('mini').locator('[data-shared-mini-clicks]').textContent()) === '1');
    const miniMotion = await scene('mini').locator('.openui-mini-line-chart-line').first().evaluate(e => {
      const s = getComputedStyle(e); return { animationName: s.animationName, animationDuration: s.animationDuration, opacity: s.opacity, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
    });
    observations.miniMotion = miniMotion;
    check('mini readable after natural finite entrance', miniMotion.opacity === '1', miniMotion);
    check('mini media activation follows current motion preference', miniMotion.reduced ? miniMotion.animationName === 'none' : miniMotion.animationName !== 'none', miniMotion);

    const horizontal = scene('horizontal-scroll');
    await horizontal.locator('.openui-chart-horizontal-scroll-buttons-container').waitFor({ state: 'attached' });
    const left = horizontal.locator('.openui-chart-horizontal-scroll-button--left');
    const right = horizontal.locator('.openui-chart-horizontal-scroll-button--right');
    await right.waitFor({ state: 'visible' });
    check('horizontal left is genuinely disabled initially', await left.isDisabled());
    check('disabled horizontal is CSS hidden', await left.evaluate(e => getComputedStyle(e).visibility === 'hidden'));
    await probe('horizontal root owned position', { target: horizontal.locator('.openui-chart-horizontal-scroll-controls-root'), cssSelector: '.openui-chart-horizontal-scroll-controls-root', property: 'position', value: 'static' });
    await probe('disabled scroll matching cursor', { target: left, cssSelector: '.openui-chart-horizontal-scroll-controls-root .openui-chart-horizontal-scroll-button--disabled:disabled', property: 'cursor', value: 'wait' });
    check('horizontal right starts enabled', await right.isEnabled());
    await right.click();
    await page.waitForFunction(() => document.querySelector('[data-shared-chart-scene="horizontal-scroll"] .openui-bar-chart-main-container')?.scrollLeft > 0);
    check('horizontal real scroll enables left', await left.isEnabled());

    const vertical = scene('vertical-scroll');
    await vertical.locator('.openui-chart-vertical-scroll-buttons-container').waitFor({ state: 'attached' });
    await probe('vertical root owned padding', { target: vertical.locator('.openui-chart-vertical-scroll-controls-root'), cssSelector: '.openui-chart-vertical-scroll-controls-root', property: 'padding-left', value: '17px' });
    const down = vertical.getByRole('button', { name: 'Scroll down', exact: true });
    check('vertical down starts enabled', await down.isEnabled());
    await down.click();
    await page.waitForFunction(() => document.querySelector('[data-shared-chart-scene="vertical-scroll"] .openui-horizontal-bar-chart-main-container')?.scrollTop > 0);
    await settle(page);
    check('vertical scroll enables up', await vertical.getByRole('button', { name: 'Scroll up', exact: true }).isEnabled());

    await probe('stacked root owned alignment', { target: scene('standalone-legend').locator('.openui-chart-stacked-legend-root'), cssSelector: '.openui-chart-stacked-legend-root', property: 'align-items', value: 'flex-start' });
    await probe('stacked layout owned gap', { target: scene('stacked-row').locator('.openui-chart-stacked-legend-layout-root'), cssSelector: '.openui-chart-stacked-legend-layout-root', property: 'gap', value: '23px' });
    await probe('stacked scrollbar pseudo-owned display only', { target: scene('standalone-legend').locator('.openui-chart-stacked-legend-scrollbar'), cssSelector: '.openui-chart-stacked-legend-scrollbar::-webkit-scrollbar', pseudo: '::-webkit-scrollbar', property: 'display', value: 'block' });
    check('stacked pie row layout is actual row', await scene('stacked-row').locator('.openui-chart-with-stacked-legend--row').count() === 1);
    check('stacked pie column layout is actual column', await scene('stacked-column').locator('.openui-chart-with-stacked-legend--column').count() === 1);
    const column = scene('stacked-column');
    const beforeMore = await column.locator('.openui-stacked-legend__item').count();
    await column.locator('.openui-stacked-legend-show-more-button').click(); await settle(page);
    check('stacked show-more expands actual rows', await column.locator('.openui-stacked-legend__item').count() > beforeMore, { beforeMore });

    const standalone = scene('standalone-legend'), row = standalone.locator('.openui-stacked-legend__item').first();
    await row.hover(); await settle(page);
    check('standalone active state follows actual hover', await row.evaluate(e => e.classList.contains('openui-stacked-legend__item--active')));
    await probe('stacked matching hover background', { target: row, cssSelector: '.openui-chart-stacked-legend-root :hover:where(.openui-stacked-legend__item)', property: 'background-color', value: 'rgb(81, 82, 83)' });
    await row.click(); await settle(page);
    check('standalone row toggle preserves inline hidden state', await row.evaluate(e => getComputedStyle(e).opacity === '0.3'));
    await row.click(); await settle(page);
    check('standalone row toggle restores state', await row.evaluate(e => getComputedStyle(e).opacity === '1'));
    const scrollDown = standalone.getByRole('button', { name: 'Scroll legend down', exact: true });
    check('standalone actual overflow affordance', await scrollDown.isEnabled());
    await scrollDown.click();
    await page.waitForFunction(() => document.querySelector('[data-shared-chart-scene="standalone-legend"] .openui-stacked-legend')?.scrollTop > 0);
    check('legend actual scrolling enables up', await standalone.getByRole('button', { name: 'Scroll legend up', exact: true }).isEnabled());
    await page.mouse.move(0, 0);
    observations.finalHookCounts = await collect();
    if (arm === 'candidate') check('all twelve actual shared canonical targets observed', observed.size === sharedTargets.length, { observed: [...observed], missing: sharedTargets.filter(h => !observed.has(h)) });
    observations.hostAfterInteractions = await page.evaluate(sharedHostSnapshotInPage);
  } catch (error) {
    check('shared probe execution completed', false, { message: String(error), stack: error.stack });
  }
  return { arm, theme, config, status: 'UNACCEPTED raw run; inspect failed checks and pair observations', checks, observations, observedCanonicalTargets: [...observed], limits: ['No inline geometry override assertion', 'Scrollbar pseudo display is not a claim that native scrollbars become visible', 'Normal/reduced motion require separate existing-harness pages', 'No SSR/performance/memory acceptance'] };
}

export function compareSharedPair(baseline, candidate) {
  return ['default', 'tooltip', 'miniMotion', 'hostAfterInteractions'].map(key => ({ name: 'shared paired ' + key, pass: baseline.observations[key] !== undefined && candidate.observations[key] !== undefined && JSON.stringify(baseline.observations[key]) === JSON.stringify(candidate.observations[key]) }));
}
