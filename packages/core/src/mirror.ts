const state = {
  active: new Map<string, { tool: { name: string; description: string }; startTime: number; params: Record<string, unknown> }>(),
  indicator: null as HTMLElement | null,
  cssPrefix: 'agentic-js',
  enabled: true,
};

function ensureIndicator(): HTMLElement {
  if (state.indicator) return state.indicator;
  const el = document.createElement('div');
  el.id = `${state.cssPrefix}-indicator`;
  el.innerHTML = `<div style="position:fixed;bottom:16px;right:16px;width:10px;height:10px;border-radius:50%;background:#3b82f6;z-index:2147483646;" title="Agentic JS Active"></div>`;
  document.body.appendChild(el);
  state.indicator = el;
  return el;
}

function injectStyles(): void {
  if (document.getElementById(`${state.cssPrefix}-styles`)) return;
  const style = document.createElement('style');
  style.id = `${state.cssPrefix}-styles`;
  style.textContent = `
    @keyframes ${state.cssPrefix}-pulse {
      0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
      70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
      100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    }
    .${state.cssPrefix}-mirror-focus { outline: 2px solid #3b82f6 !important; outline-offset: 2px !important; }
    .${state.cssPrefix}-mirror-changed { animation: ${state.cssPrefix}-flash 0.5s ease; }
    @keyframes ${state.cssPrefix}-flash {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(59,130,246,0.15); }
    }
  `;
  document.head.appendChild(style);
}

function pulseIndicator(active: boolean): void {
  const dot = state.indicator?.querySelector('div') as HTMLElement;
  if (!dot) return;
  if (active) {
    dot.style.animation = `${state.cssPrefix}-pulse 1.5s infinite`;
    dot.style.background = '#10b981';
  } else {
    dot.style.animation = '';
    dot.style.background = '#3b82f6';
  }
}

export function mirrorElementValue(selector: string, value: unknown): boolean {
  if (!state.enabled) return false;
  const el = document.querySelector(selector);
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  try {
    if (tag === 'input') {
      const input = el as HTMLInputElement;
      if (input.type === 'checkbox') {
        input.checked = Boolean(value);
      } else {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setter?.call(input, String(value ?? ''));
      }
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (tag === 'select') {
      (el as HTMLSelectElement).value = String(value ?? '');
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    el.classList.add(`${state.cssPrefix}-mirror-focus`);
    setTimeout(() => el.classList.remove(`${state.cssPrefix}-mirror-focus`), 1500);
    return true;
  } catch { return false; }
}

export function onToolStart(
  toolName: string, tool: { name: string; description: string; sourceElement?: string },
  params: Record<string, unknown>,
): void {
  if (!state.enabled) return;
  state.active.set(`${toolName}-${Date.now()}`, { tool, startTime: Date.now(), params });
  pulseIndicator(true);
  if (tool.sourceElement) {
    for (const [key, value] of Object.entries(params)) {
      mirrorElementValue(`[name="${key}"]`, value);
    }
  }
}

export function onToolComplete(toolName: string): void {
  for (const [id, entry] of state.active) {
    if (entry.tool.name === toolName) { state.active.delete(id); break; }
  }
  if (state.active.size === 0) pulseIndicator(false);
}

export function watchNavigation(callback: () => void): () => void {
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = function (data: any, unused: string, url?: string | URL | null) {
    origPush(data, unused, url);
    callback();
  };
  history.replaceState = function (data: any, unused: string, url?: string | URL | null) {
    origReplace(data, unused, url);
    callback();
  };
  window.addEventListener('popstate', callback);
  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
    window.removeEventListener('popstate', callback);
  };
}

export function initMirroring(config: { cssPrefix: string; enabled?: boolean }): void {
  state.cssPrefix = config.cssPrefix;
  state.enabled = config.enabled !== false;
  if (state.enabled) { injectStyles(); ensureIndicator(); }
}
