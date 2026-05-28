// @agentic-js/core — Shadow DOM & Web Component Support
// Extends the auto-inference engine into Shadow DOM boundaries
// for frameworks using Web Components (Lit, Stencil, Fast, etc.)

/**
 * Walk all shadow roots within a DOM tree.
 * Yields shadow roots encountered, allowing the inference engine
 * to scan into encapsulated component trees.
 */
export function* walkShadowRoots(root: Document | ShadowRoot | Element): Generator<ShadowRoot> {
  const walker = document.createTreeWalker(
    root instanceof Document ? root.documentElement : root as Node,
    NodeFilter.SHOW_ELEMENT,
  );

  let node = walker.nextNode();
  while (node) {
    const el = node as Element;
    if (el.shadowRoot) {
      yield el.shadowRoot;
      // Recurse into nested shadow roots
      for (const nested of walkShadowRoots(el.shadowRoot)) {
        yield nested;
      }
    }
    node = walker.nextNode();
  }
}

/**
 * Query a CSS selector across the document including all shadow roots.
 * Returns all matching elements, including those inside Shadow DOM.
 */
export function querySelectorAllDeep(selector: string): Element[] {
  const results: Element[] = [];

  // Query the light DOM
  try {
    const lightMatches = document.querySelectorAll(selector);
    results.push(...Array.from(lightMatches));
  } catch {
    // Invalid selector — skip
  }

  // Query inside shadow roots
  for (const shadowRoot of walkShadowRoots(document)) {
    try {
      const shadowMatches = shadowRoot.querySelectorAll(selector);
      results.push(...Array.from(shadowMatches));
    } catch {
      // Skip shadow roots that throw
    }
  }

  return results;
}

/**
 * Check if a shadow root's adoptedStyleSheets or <style> elements
 * could conflict with agentic-js injected styles.
 * Returns true if potential z-index conflicts are detected.
 */
export function detectStyleConflicts(shadowRoot: ShadowRoot): string[] {
  const warnings: string[] = [];
  const highZRegex = /z-index\s*:\s*(\d{7,})/g;

  // Check adoptedStyleSheets
  if (shadowRoot.adoptedStyleSheets) {
    for (const sheet of shadowRoot.adoptedStyleSheets) {
      try {
        const text = Array.from(sheet.cssRules)
          .map((r) => r.cssText)
          .join('');
        if (highZRegex.test(text)) {
          warnings.push('Shadow root has z-index >= 10,000,000 — may conflict with HITL modal');
          highZRegex.lastIndex = 0;
        }
      } catch {
        // Cross-origin stylesheet — can't inspect
      }
    }
  }

  // Check <style> elements
  const styles = shadowRoot.querySelectorAll('style');
  for (const style of styles) {
    if (highZRegex.test(style.textContent || '')) {
      warnings.push(`Shadow root <style> contains z-index >= 10,000,000`);
      highZRegex.lastIndex = 0;
    }
  }

  return warnings;
}

/**
 * Force-resolve z-index conflicts by patching the HITL modal's z-index
 * to exceed any detected maximum. Returns the new z-index value.
 */
export function resolveZIndexConflicts(): number {
  let maxZ = 2147483647; // agentic-js default max

  // Scan all elements for z-index values
  const allElements = document.querySelectorAll('*');
  for (const el of allElements) {
    const computed = getComputedStyle(el);
    const zIndex = parseInt(computed.zIndex, 10);
    if (!isNaN(zIndex) && zIndex > maxZ) {
      maxZ = zIndex;
    }
  }

  // Add buffer
  const resolvedZ = maxZ + 1000;

  // Patch existing HITL modals
  const modals = document.querySelectorAll('[class*="hitl-backdrop"]');
  for (const modal of modals) {
    (modal as HTMLElement).style.zIndex = String(resolvedZ);
  }

  return resolvedZ;
}
