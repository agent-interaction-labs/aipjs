import type { ToolSchema, ToolParameter } from '@aipjs/types';
import { RiskLevel, ActionCategory } from '@aipjs/types';

const SEARCH_SELECTORS = [
  'input[type="search"]', 'input[name*="search" i]', 'input[name*="query" i]',
  'input[name="q"]', 'input[placeholder*="search" i]', 'input[role="searchbox"]',
  'input[role="combobox"]', 'form[role="search"] input', '[data-aip-search]',
];

const FILTER_SELECTORS = [
  'select', 'input[type="checkbox"]', 'input[type="radio"]',
  '[role="radiogroup"]', 'input[type="range"]', '[data-aip-filter]',
];

const SORT_SELECTORS = [
  'select[name*="sort" i]', 'select[aria-label*="sort" i]', '[data-aip-sort]',
];

const MUTATION_SELECTORS = [
  'button[type="submit"]', 'input[type="submit"]',
  'form[action*="cart" i] button[type="submit"]',
  'form[action*="checkout" i] button[type="submit"]',
  '[data-aip-confirm]',
];

function getElementLabel(el: Element): string {
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label?.textContent) return label.textContent.trim();
  }
  const parentLabel = el.closest('label');
  if (parentLabel?.textContent) return parentLabel.textContent.replace(el.textContent || '', '').trim();
  const placeholder = (el as HTMLInputElement).placeholder;
  if (placeholder) return placeholder;
  const name = el.getAttribute('name');
  if (name) return name.replace(/[_-]/g, ' ');
  const text = el.textContent?.trim();
  if (text && text.length < 80) return text;
  return el.tagName.toLowerCase();
}

function inferParameterType(el: Element): ToolParameter['type'] {
  const tag = el.tagName.toLowerCase();
  const type = (el as HTMLInputElement).type;
  if (tag === 'select') return 'string';
  if (tag === 'input') {
    if (type === 'number' || type === 'range') return 'number';
    if (type === 'checkbox' || type === 'radio') return 'boolean';
  }
  if (el.getAttribute('role') === 'radiogroup') return 'string';
  return 'string';
}

function getElementSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const name = el.getAttribute('name');
  if (name) return `[name="${CSS.escape(name)}"]`;
  const testId = el.getAttribute('data-testid');
  if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
  return el.tagName.toLowerCase();
}

function classifyRisk(el: Element): RiskLevel {
  const explicit = el.getAttribute('data-aip-risk');
  if (explicit === 'high_risk') return RiskLevel.HIGH_RISK;
  if (explicit === 'safe') return RiskLevel.SAFE;
  const tag = el.tagName.toLowerCase();
  if (tag === 'button' || tag === 'input') {
    const type = el.getAttribute('type');
    if (type === 'submit') return RiskLevel.HIGH_RISK;
  }
  if (el.closest('form[action*="cart" i]') || el.closest('form[action*="checkout" i]'))
    return RiskLevel.HIGH_RISK;
  if (el.hasAttribute('data-aip-confirm')) return RiskLevel.HIGH_RISK;
  const href = (el as HTMLAnchorElement).href;
  if (href && /(checkout|subscribe|upgrade|delete|remove)/i.test(href))
    return RiskLevel.HIGH_RISK;
  return RiskLevel.SAFE;
}

function classifyCategory(el: Element): ActionCategory {
  if (el.matches(SEARCH_SELECTORS.join(','))) return ActionCategory.SEARCH;
  if (el.matches(FILTER_SELECTORS.join(','))) return ActionCategory.FILTER;
  if (el.matches(SORT_SELECTORS.join(','))) return ActionCategory.SORT;
  if (el.tagName.toLowerCase() === 'a') return ActionCategory.NAVIGATE;
  const typeAttr = (el as HTMLInputElement).type;
  if (typeAttr === 'submit') return ActionCategory.MUTATE;
  const explicit = el.getAttribute('data-aip-category');
  if (explicit) return explicit as ActionCategory;
  return ActionCategory.CUSTOM;
}

function extractParameters(el: Element): ToolParameter[] {
  const params: ToolParameter[] = [];
  const tag = el.tagName.toLowerCase();
  if (tag === 'select') {
    const select = el as HTMLSelectElement;
    const options = Array.from(select.options).filter(o => o.value).map(o => o.value);
    params.push({
      name: getElementSelector(el), type: 'string', description: getElementLabel(el),
      required: select.required, enum: options.length > 0 ? options : undefined,
    });
  } else if (tag === 'input') {
    const input = el as HTMLInputElement;
    params.push({
      name: getElementSelector(el), type: inferParameterType(el),
      description: getElementLabel(el), required: input.required,
    });
  } else if (tag === 'button' || tag === 'a') {
    const dataParams = el.getAttribute('data-aip-params');
    if (dataParams) {
      try {
        const parsed = JSON.parse(dataParams) as Record<string, unknown>;
        for (const [key, value] of Object.entries(parsed)) {
          params.push({ name: key, type: typeof value as ToolParameter['type'], description: key, required: true });
        }
      } catch (err) {
        console.warn(`[@aipjs/core] Failed to parse data-aip-params on element:`, el, err);
      }
    }
  }
  return params;
}

function generateToolSchema(el: Element, index: number): ToolSchema {
  const category = classifyCategory(el);
  const label = getElementLabel(el);
  const name = el.getAttribute('data-aip-name') ||
    `${category}_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${index}`;
  const description = el.getAttribute('data-aip-description') ||
    `${category === ActionCategory.MUTATE ? '[REQUIRES HUMAN APPROVAL] ' : ''}${label}`;
  return {
    name, description, riskLevel: classifyRisk(el), category,
    parameters: extractParameters(el), sourceElement: getElementSelector(el),
    metadata: { inferred: true, url: window.location.href },
  };
}

export interface InferenceResult {
  tools: ToolSchema[]; total: number; safe: number; highRisk: number;
  categories: Record<string, number>;
}

export function inferTools(config: { rootSelector?: string; tagAllowlist?: string[] } = {}): InferenceResult {
  const root = config.rootSelector ? document.querySelector(config.rootSelector) || document.body : document.body;
  const toolSchemas: ToolSchema[] = [];
  const seen = new Set<Element>();
  let idx = 0;
  const selectors = [...SEARCH_SELECTORS, ...FILTER_SELECTORS, ...SORT_SELECTORS, ...MUTATION_SELECTORS];
  for (const sel of selectors) {
    try {
      root.querySelectorAll(sel).forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        if (config.tagAllowlist?.length && !config.tagAllowlist.includes(el.tagName.toLowerCase())) return;
        toolSchemas.push(generateToolSchema(el, idx++));
      });
    } catch { /* skip invalid selectors */ }
  }
  const safe = toolSchemas.filter(t => t.riskLevel === RiskLevel.SAFE).length;
  const highRisk = toolSchemas.filter(t => t.riskLevel === RiskLevel.HIGH_RISK).length;
  const categories: Record<string, number> = {};
  for (const t of toolSchemas) categories[t.category] = (categories[t.category] || 0) + 1;
  return { tools: toolSchemas, total: toolSchemas.length, safe, highRisk, categories };
}
