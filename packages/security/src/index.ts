// @aipjs/security — HITL Verification + Prompt Injection Protection

import type { HITLRequest, HITLResponse } from '@aipjs/types';
import { HITLAction, RiskLevel, AgentBridgeEvent } from '@aipjs/types';

// ============================================================================
// Prompt Injection Sanitizer
// ============================================================================

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|system)\s+(instructions?|prompts?|directives?)/i,
  /you\s+are\s+now\s+(a\s+)?/i,
  /system\s*prompt\s*[:=]/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(instructions?|constraints?)/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /\[SYS\]/i,
  /<system>/i,
  /\u200B/, // zero-width space
  /\u200C/, // zero-width non-joiner
  /\uFEFF/, // zero-width no-break space
];

export function sanitizePayload(value: unknown): unknown {
  if (typeof value !== 'string') {
    if (Array.isArray(value)) return value.map(sanitizePayload);
    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        sanitized[key === '__proto__' || key === 'constructor' ? `_sanitized_${key}` : key] = sanitizePayload(val);
      }
      return sanitized;
    }
    return value;
  }
  let s = value.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  if (s.length > 10000) s = s.slice(0, 10000) + '\u2026[truncated]';
  for (const p of INJECTION_PATTERNS) {
    if (p.test(s)) { s = `[SANITIZED] ${s.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`; break; }
  }
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export { INJECTION_PATTERNS };

// ============================================================================
// HITL Modal
// ============================================================================

function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function injectHITLStyles(prefix: string): void {
  if (document.getElementById(`${prefix}-hitl-styles`)) return;
  const s = document.createElement('style');
  s.id = `${prefix}-hitl-styles`;
  s.textContent = `
    .${prefix}-hitl-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:2147483647;animation:${prefix}-fade-in 0.2s ease;font-family:system-ui,sans-serif}
    @keyframes ${prefix}-fade-in{from{opacity:0}to{opacity:1}}
    .${prefix}-hitl-modal{background:#fff;border-radius:12px;max-width:520px;width:90%;box-shadow:0 25px 80px rgba(0,0,0,0.4);overflow:hidden}
    .${prefix}-hitl-header{background:#fef3c7;padding:20px 24px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #fde68a}
    .${prefix}-hitl-header h2{margin:0;font-size:16px;font-weight:600;color:#92400e}
    .${prefix}-hitl-body{padding:20px 24px}
    .${prefix}-hitl-body p{margin:0 0 12px;font-size:14px;color:#374151}
    .${prefix}-hitl-detail{display:flex;gap:8px;margin-bottom:6px;font-size:13px;color:#4b5563}
    .${prefix}-hitl-detail strong{min-width:80px;color:#6b7280}
    .${prefix}-hitl-risk{padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700}
    .${prefix}-hitl-risk.high_risk{background:#fee2e2;color:#dc2626}
    .${prefix}-hitl-payload summary{cursor:pointer;color:#6b7280;font-size:12px;font-weight:500}
    .${prefix}-hitl-payload pre{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-top:8px;font-size:12px;max-height:200px;overflow:auto;color:#1f2937}
    .${prefix}-hitl-timer{margin:12px 0 0;font-size:13px;color:#9ca3af;text-align:center}
    .${prefix}-hitl-footer{padding:16px 24px;display:flex;gap:12px;justify-content:flex-end;border-top:1px solid #f3f4f6}
    .${prefix}-hitl-btn{padding:10px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer}
    .${prefix}-hitl-btn.approve{background:#059669;color:#fff}
    .${prefix}-hitl-btn.approve:hover{background:#047857;box-shadow:0 4px 12px rgba(5,150,105,0.3)}
    .${prefix}-hitl-btn.deny{background:#f3f4f6;color:#6b7280}
    .${prefix}-hitl-btn.deny:hover{background:#e5e7eb;color:#374151}
  `;
  document.head.appendChild(s);
}

function createHITLModal(prefix: string, timeout: number) {
  injectHITLStyles(prefix);

  return {
    show(request: HITLRequest): Promise<HITLResponse> {
      return new Promise(resolve => {
        let resolved = false;
        const backdrop = document.createElement('div');
        backdrop.className = `${prefix}-hitl-backdrop`;
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');

        const secs = Math.ceil(timeout / 1000);
        backdrop.innerHTML = `
          <div class="${prefix}-hitl-modal">
            <div class="${prefix}-hitl-header">
              <span style="font-size:28px">\u26A0\uFE0F</span>
              <h2>Agent Request \u2014 Human Approval Required</h2>
            </div>
            <div class="${prefix}-hitl-body">
              <p><strong>An AI agent wants to perform a high-risk action:</strong></p>
              <div class="${prefix}-hitl-detail"><strong>Action:</strong><span>${escapeHTML(request.description)}</span></div>
              <div class="${prefix}-hitl-detail"><strong>Tool:</strong><code>${escapeHTML(request.toolName)}</code></div>
              <div class="${prefix}-hitl-detail"><strong>Risk:</strong><span class="${prefix}-hitl-risk high_risk">HIGH RISK</span></div>
              <details class="${prefix}-hitl-payload"><summary>View Payload</summary><pre>${escapeHTML(JSON.stringify(request.payload, null, 2))}</pre></details>
              <p class="${prefix}-hitl-timer">Auto-denying in <span id="${prefix}-countdown">${secs}</span> seconds...</p>
            </div>
            <div class="${prefix}-hitl-footer">
              <button class="${prefix}-hitl-btn deny" id="${prefix}-hitl-deny">\u2715 Deny</button>
              <button class="${prefix}-hitl-btn approve" id="${prefix}-hitl-approve">\u2713 Approve</button>
            </div>
          </div>
        `;
        document.body.appendChild(backdrop);

        let countdown = secs;
        const cdEl = document.getElementById(`${prefix}-countdown`);
        const timerInt = setInterval(() => {
          countdown--;
          if (cdEl) cdEl.textContent = String(Math.max(0, countdown));
          if (countdown <= 0) clearInterval(timerInt);
        }, 1000);

        const tId = setTimeout(() => {
          if (!resolved) { resolved = true; clearInterval(timerInt); destroy(); resolve({ requestId: request.id, action: HITLAction.TIMEOUT, timestamp: Date.now() }); }
        }, timeout);

        const destroy = () => { clearTimeout(tId); clearInterval(timerInt); backdrop.remove(); };

        document.getElementById(`${prefix}-hitl-approve`)?.addEventListener('click', () => {
          if (!resolved) { resolved = true; destroy(); resolve({ requestId: request.id, action: HITLAction.APPROVE, timestamp: Date.now() }); }
        });
        document.getElementById(`${prefix}-hitl-deny`)?.addEventListener('click', () => {
          if (!resolved) { resolved = true; destroy(); resolve({ requestId: request.id, action: HITLAction.DENY, reason: 'User denied', timestamp: Date.now() }); }
        });
        backdrop.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') { e.preventDefault(); if (!resolved) { resolved = true; destroy(); resolve({ requestId: request.id, action: HITLAction.DENY, reason: 'ESC pressed', timestamp: Date.now() }); } }
        });
      });
    },
    destroy() {
      document.querySelectorAll(`.${prefix}-hitl-backdrop`).forEach(el => el.remove());
    },
  };
}

// ============================================================================
// HITL Manager
// ============================================================================

export interface HITLManagerOptions {
  cssPrefix: string;
  hitlTimeout: number;
}

export function createHITLManager(options: HITLManagerOptions) {
  const modal = createHITLModal(options.cssPrefix, options.hitlTimeout);
  let listening = false;

  function listen(): void {
    if (listening) return;
    listening = true;
    const handler = (event: Event) => {
      const request = (event as CustomEvent).detail as HITLRequest;
      if (!request?.id) return;
      modal.show(request).then(response => {
        window.dispatchEvent(new CustomEvent(AgentBridgeEvent.HITL_RESPONSE, { detail: response, bubbles: true }));
      }).catch((err: unknown) => {
        console.error('[@aipjs/security] HITL error:', err);
      });
    };
    window.addEventListener(AgentBridgeEvent.HITL_REQUEST, handler as EventListener);
  }

  function destroy(): void { listening = false; modal.destroy(); }
  return { listen, destroy, modal };
}
