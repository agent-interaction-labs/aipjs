/**
 * Unit tests: buildAutoHandler — auto-generated DOM handlers for inferred tools
 * Runs in jsdom with real DOM elements.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  if (!(globalThis as any).CSS) (globalThis as any).CSS = {};
  if (!CSS.escape) CSS.escape = (v: string) => v.replace(/[^a-zA-Z0-9-]/g, '\\$&');

  document.body.innerHTML = `
    <form id="search-form" role="search">
      <input type="search" name="q" placeholder="Search..." aria-label="Search products">
    </form>
    <form id="filter-form">
      <select name="category" aria-label="Filter by category">
        <option value="">All</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>
    </form>
    <form id="price-form">
      <input type="range" name="maxPrice" min="0" max="1000" value="500" aria-label="Maximum price">
    </form>
    <form id="stock-form">
      <input type="checkbox" name="inStock" aria-label="In stock only">
    </form>
    <form id="cart-form" action="/cart/add" method="post">
      <input type="hidden" name="productId" value="">
      <input type="hidden" name="quantity" value="">
      <button type="submit" class="btn-add-cart">Add to Cart</button>
    </form>
    <form id="no-hidden-form" action="/cart/add">
      <button type="submit">Checkout</button>
    </form>
    <a id="nav-link" href="/products">View Products</a>
    <a id="checkout-link" href="/checkout">Proceed to Checkout</a>
    <input type="search" id="standalone-input" name="q" aria-label="Standalone search">
  `;
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('buildAutoHandler', () => {
  it('fills a search input and dispatches input+change events', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const searchTool = result.tools.find(t => t.category === 'search');
    expect(searchTool).toBeDefined();

    const handler = searchTool!.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;
    expect(handler).toBeDefined();

    const input = document.querySelector('input[type="search"]') as HTMLInputElement;
    let inputFired = false;
    let changeFired = false;
    input.addEventListener('input', () => { inputFired = true; });
    input.addEventListener('change', () => { changeFired = true; });

    const handlerResult = await handler({ q: 'headphones' });
    expect(input.value).toBe('headphones');
    expect(inputFired).toBe(true);
    expect(changeFired).toBe(true);
    expect((handlerResult as any).success).toBe(true);
  });

  it('sets a select value and dispatches change event', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const filterTool = result.tools.find(t => t.category === 'filter');
    expect(filterTool).toBeDefined();

    const handler = filterTool!.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;
    const select = document.querySelector('select[name="category"]') as HTMLSelectElement;
    let changeFired = false;
    select.addEventListener('change', () => { changeFired = true; });

    await handler({ category: 'electronics' });
    expect(select.value).toBe('electronics');
    expect(changeFired).toBe(true);
  });

  it('sets a range input value and dispatches input event', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const rangeTool = result.tools.find(t => t.category === 'filter' && t.description.includes('price'));
    expect(rangeTool).toBeDefined();

    const handler = rangeTool!.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;
    const range = document.querySelector('input[type="range"]') as HTMLInputElement;
    let inputFired = false;
    range.addEventListener('input', () => { inputFired = true; });

    await handler({ maxPrice: 250 });
    expect(range.value).toBe('250');
    expect(inputFired).toBe(true);
  });

  it('toggles a checkbox', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const checkboxTool = result.tools.find(t => t.description.includes('stock'));
    expect(checkboxTool).toBeDefined();

    const handler = checkboxTool!.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;
    const cb = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(cb.checked).toBe(false);

    await handler({ inStock: true });
    // Boolean cast: true → checked
    expect(cb.checked).toBe(true);

    await handler({ inStock: false });
    expect(cb.checked).toBe(false);
  });

  it('fills hidden inputs and submits the form for a submit button', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const cartTool = result.tools.find(t => t.riskLevel === 'high_risk');
    expect(cartTool).toBeDefined();

    const handler = cartTool!.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;
    const form = document.getElementById('cart-form') as HTMLFormElement;
    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });

    await handler({ productId: 'WH-001', quantity: 2 });

    const productInput = form.querySelector('input[name="productId"]') as HTMLInputElement;
    const qtyInput = form.querySelector('input[name="quantity"]') as HTMLInputElement;
    expect(productInput.value).toBe('WH-001');
    expect(qtyInput.value).toBe('2');
    expect(submitted).toBe(true);
  });

  it('submits a form even without hidden inputs', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const checkoutTool = result.tools.find(
      t => t.riskLevel === 'high_risk' && t.name.toLowerCase().includes('checkout')
    );
    expect(checkoutTool).toBeDefined();

    const handler = checkoutTool!.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;
    const form = document.getElementById('no-hidden-form') as HTMLFormElement;
    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });

    await handler({});
    expect(submitted).toBe(true);
  });

  it('navigates for anchor elements', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const navTool = result.tools.find(t => t.category === 'navigate' && t.name.toLowerCase().includes('products'));
    expect(navTool).toBeDefined();

    const handler = navTool!.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;

    // jsdom doesn't implement navigation — verify handler runs and returns success
    const res = await handler({});
    expect(res).toBeDefined();
    expect((res as any).success).toBe(true);
    expect((res as any).action).toBe('navigate');
  });

  it('classifies checkout links as HIGH_RISK with HITL', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const checkoutLink = result.tools.find(
      t => t.category === 'navigate' && t.riskLevel === 'high_risk'
    );
    expect(checkoutLink).toBeDefined();
    expect(checkoutLink!.description).toContain('[REQUIRES HUMAN APPROVAL]');
  });

  it('handles standalone inputs (not in a form)', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const standaloneTool = result.tools.find(t => t.description.includes('Standalone'));
    expect(standaloneTool).toBeDefined();

    const handler = standaloneTool!.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;
    const input = document.getElementById('standalone-input') as HTMLInputElement;
    let changeFired = false;
    input.addEventListener('change', () => { changeFired = true; });

    const res = await handler({ q: 'test value' });
    expect(input.value).toBe('test value');
    expect(changeFired).toBe(true);
    expect((res as any).success).toBe(true);
  });

  it('returns success payload with element and params', async () => {
    const { inferTools } = await import('@aixa/core');
    const result = inferTools();
    const searchTool = result.tools.find(t => t.category === 'search')!;
    const handler = searchTool.metadata!._handler as (p: Record<string, unknown>) => Promise<unknown>;

    const res = await handler({ q: 'test' }) as any;
    expect(res.success).toBe(true);
    expect(res.action).toBe('search');
    expect(res.params).toEqual({ q: 'test' });
    expect(res.element).toBeDefined();
  });
});
