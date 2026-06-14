// @aipjs/core — Memory Leak Protection
// Guards against DOM MutationObserver leaks, dangling event listeners,
// and orphaned injected elements in long-running SPAs.

interface TrackedResource {
  type: 'observer' | 'listener' | 'element' | 'timer';
  target: string; // description for debugging
  cleanup: () => void;
}

const tracked = new Set<TrackedResource>();
let leakCheckInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Register a resource for tracking and automatic cleanup.
 */
export function trackResource(resource: TrackedResource): void {
  tracked.add(resource);
}

/**
 * Create a tracked MutationObserver that auto-disconnects when the target is removed from DOM.
 */
export function createTrackedObserver(
  target: Node,
  config: MutationObserverInit,
  callback: MutationCallback,
  description: string,
): MutationObserver {
  const observer = new MutationObserver(callback);
  observer.observe(target, config);

  const cleanup = (): void => {
    observer.disconnect();
    tracked.delete(resource);
  };

  const resource: TrackedResource = {
    type: 'observer',
    target: description,
    cleanup,
  };

  tracked.add(resource);

  // Auto-cleanup when target is removed from DOM
  const removalObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.removedNodes)) {
        if (node === target || node.contains(target)) {
          cleanup();
          removalObserver.disconnect();
          return;
        }
      }
    }
  });

  if (target.parentNode) {
    removalObserver.observe(target.parentNode, { childList: true });
  }

  return observer;
}

/**
 * Start periodic memory leak detection.
 * Logs warnings if tracked resources exceed thresholds.
 */
export function startLeakDetection(intervalMs = 30000): () => void {
  if (leakCheckInterval) return () => { if (leakCheckInterval) clearInterval(leakCheckInterval); };

  leakCheckInterval = setInterval(() => {
    const counts = {
      observer: 0,
      listener: 0,
      element: 0,
      timer: 0,
    };

    for (const r of tracked) {
      counts[r.type]++;
    }

    // Warning thresholds
    if (counts.observer > 20) {
      console.warn(
        `[agentic-js] Memory leak warning: ${counts.observer} active MutationObservers. ` +
        'Consider calling agentic.stop() on route changes.',
      );
    }
    if (counts.listener > 50) {
      console.warn(
        `[agentic-js] Memory leak warning: ${counts.listener} active event listeners.`,
      );
    }

    if (counts.observer + counts.listener + counts.element + counts.timer > 100) {
      console.error(
        `[agentic-js] CRITICAL: ${counts.observer + counts.listener + counts.element + counts.timer} total tracked resources. ` +
        'Possible memory leak. Call agentic.stop() and re-initialize.',
      );
    }
  }, intervalMs);

  return () => {
    clearInterval(leakCheckInterval!);
    leakCheckInterval = null;
  };
}

/**
 * Get current tracked resource counts.
 */
export function getLeakStats(): { observers: number; listeners: number; elements: number; timers: number } {
  let observers = 0, listeners = 0, elements = 0, timers = 0;
  for (const r of tracked) {
    switch (r.type) {
      case 'observer': observers++; break;
      case 'listener': listeners++; break;
      case 'element': elements++; break;
      case 'timer': timers++; break;
    }
  }
  return { observers, listeners, elements, timers };
}

/**
 * Force cleanup of all tracked resources.
 */
export function cleanupAll(): void {
  for (const r of tracked) {
    try { r.cleanup(); } catch { /* ignore cleanup errors */ }
  }
  tracked.clear();
}
