// @aipjs/plugin-ecommerce — Safe Search Abstraction
// Specialized for e-commerce, real estate, and travel sites.
// Exposes search, filtering, and inventory queries with ZERO mutation risk.
// Hooks into internal search APIs or window.dataLayer — no DOM scraping.

import type { SearchQuery, SearchFilter, SortCriterion, Pagination, SearchResult, ToolParameter } from '@aipjs/types';
import { RiskLevel, ActionCategory } from '@aipjs/types';
import { registerSearch, registerAction } from '@aipjs/core';

// ============================================================================
// Search API Hook
// ============================================================================

export interface EcommerceSearchConfig {
  /** API endpoint for product/inventory search */
  searchEndpoint: string;
  /** Custom search handler (overrides endpoint) */
  searchHandler?: (query: SearchQuery) => Promise<SearchResult>;
  /** API endpoint for getting item details */
  detailEndpoint?: string;
  /** Custom detail handler */
  detailHandler?: (id: string) => Promise<unknown>;
  /** Extract search state from window.dataLayer or similar */
  dataLayerKey?: string;
}

export interface EcommercePluginInstance {
  register: () => void;
  unregister: () => void;
}

/**
 * Register e-commerce search capabilities with the agentic-js SDK.
 *
 * This is the primary plugin for e-commerce, real estate, and travel sites.
 * It hooks into the site's existing search infrastructure, bypassing
 * DOM scraping entirely. Zero mutation risk — only read operations.
 *
 * @example
 *   import { ecommercePlugin } from '@aipjs/plugin-ecommerce';
 *   ecommercePlugin({
 *     searchEndpoint: '/api/v2/products/search',
 *     detailEndpoint: '/api/v2/products',
 *   }).register();
 */
export function ecommercePlugin(config: EcommerceSearchConfig): EcommercePluginInstance {
  const searchParams: ToolParameter[] = [
    { name: 'q', type: 'string', description: 'Free-text search query (product name, keywords, description)', required: false },
    { name: 'category', type: 'string', description: 'Category filter (e.g., electronics, clothing, furniture)', required: false },
    { name: 'minPrice', type: 'number', description: 'Minimum price filter', required: false },
    { name: 'maxPrice', type: 'number', description: 'Maximum price filter', required: false },
    { name: 'brand', type: 'string', description: 'Brand name filter', required: false },
    { name: 'inStock', type: 'boolean', description: 'Only show in-stock items', required: false },
    { name: 'onSale', type: 'boolean', description: 'Only show items on sale', required: false },
    { name: 'rating', type: 'number', description: 'Minimum customer rating (1-5)', required: false },
    { name: 'sortBy', type: 'string', description: 'Sort field: price, rating, newest, relevance, name', required: false, enum: ['price', 'rating', 'newest', 'relevance', 'name'] },
    { name: 'sortDir', type: 'string', description: 'Sort direction: asc or desc', required: false, enum: ['asc', 'desc'] },
    { name: 'page', type: 'number', description: 'Page number for pagination (starts at 1)', required: false },
    { name: 'pageSize', type: 'number', description: 'Number of results per page (max 100)', required: false },
  ];

  const detailParams: ToolParameter[] = [
    { name: 'id', type: 'string', description: 'Product/listing ID', required: true },
  ];

  function buildSearchQuery(params: Record<string, unknown>): SearchQuery {
    const filters: SearchFilter[] = [];
    if (params.category) filters.push({ field: 'category', operator: 'eq', value: params.category });
    if (params.minPrice !== undefined) filters.push({ field: 'price', operator: 'gte', value: Number(params.minPrice) });
    if (params.maxPrice !== undefined) filters.push({ field: 'price', operator: 'lte', value: Number(params.maxPrice) });
    if (params.brand) filters.push({ field: 'brand', operator: 'eq', value: params.brand });
    if (params.inStock !== undefined) filters.push({ field: 'inStock', operator: 'eq', value: Boolean(params.inStock) });
    if (params.onSale !== undefined) filters.push({ field: 'onSale', operator: 'eq', value: Boolean(params.onSale) });
    if (params.rating !== undefined) filters.push({ field: 'rating', operator: 'gte', value: Number(params.rating) });

    let sort: SortCriterion | undefined;
    if (params.sortBy) {
      sort = { field: String(params.sortBy), direction: (params.sortDir === 'desc' ? 'desc' : 'asc') };
    }

    const pagination: Pagination = {
      page: Number(params.page) || 1,
      pageSize: Math.min(Number(params.pageSize) || 20, 100),
    };

    return {
      q: params.q ? String(params.q) : undefined,
      filters: filters.length > 0 ? filters : undefined,
      sort,
      pagination,
    };
  }

  const defaultSearchHandler = async (params: Record<string, unknown>): Promise<SearchResult> => {
    const query = buildSearchQuery(params);
    const qs = new URLSearchParams();
    if (query.q) qs.set('q', query.q);
    if (query.pagination) {
      qs.set('page', String(query.pagination.page));
      qs.set('pageSize', String(query.pagination.pageSize));
    }
    if (query.filters) {
      for (const f of query.filters) {
        qs.set(`filter[${f.field}]`, String(f.value));
      }
    }
    if (query.sort) {
      qs.set('sortBy', query.sort.field);
      qs.set('sortDir', query.sort.direction);
    }

    const res = await fetch(`${config.searchEndpoint}?${qs.toString()}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
  };

  const defaultDetailHandler = async (params: Record<string, unknown>): Promise<unknown> => {
    const id = String(params.id);
    const res = await fetch(`${config.detailEndpoint}/${encodeURIComponent(id)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`Detail fetch failed: ${res.status}`);
    return res.json();
  };

  return {
    register(): void {
      registerSearch({
        endpoint: config.searchEndpoint,
        parameters: searchParams,
        handler: config.searchHandler || defaultSearchHandler,
        method: 'GET',
      });

      if (config.detailEndpoint) {
        const wrappedDetailHandler = config.detailHandler
          ? async (params: Record<string, unknown>) => config.detailHandler!(String(params.id))
          : defaultDetailHandler;

        registerAction({
          name: 'get_product_detail',
          description: 'Get full details for a specific product or listing by ID. Safe read-only operation.',
          parameters: detailParams,
          handler: wrappedDetailHandler,
          requiresConfirmation: false, // Read-only — no HITL needed
        });
      }
    },

    unregister(): void {
      // Cleanup handled by core's clearRegistry() or manual unregister
    },
  };
}

// ============================================================================
// Pre-built Templates for Different Verticals
// ============================================================================

export const VERTICAL_TEMPLATES = {
  ecommerce: {
    searchEndpoint: '/api/products/search',
    detailEndpoint: '/api/products',
    searchParams: [
      { name: 'q', type: 'string' as const, description: 'Product search query', required: false },
      { name: 'category', type: 'string' as const, description: 'Product category', required: false },
      { name: 'minPrice', type: 'number' as const, description: 'Min price', required: false },
      { name: 'maxPrice', type: 'number' as const, description: 'Max price', required: false },
      { name: 'brand', type: 'string' as const, description: 'Brand filter', required: false },
    ],
  },

  realEstate: {
    searchEndpoint: '/api/listings/search',
    detailEndpoint: '/api/listings',
    searchParams: [
      { name: 'q', type: 'string' as const, description: 'Location or address search', required: false },
      { name: 'propertyType', type: 'string' as const, description: 'Property type (house, apartment, condo, land)', required: false },
      { name: 'minPrice', type: 'number' as const, description: 'Min price', required: false },
      { name: 'maxPrice', type: 'number' as const, description: 'Max price', required: false },
      { name: 'minBedrooms', type: 'number' as const, description: 'Min bedrooms', required: false },
      { name: 'minBathrooms', type: 'number' as const, description: 'Min bathrooms', required: false },
      { name: 'minArea', type: 'number' as const, description: 'Min square footage', required: false },
    ],
  },

  travel: {
    searchEndpoint: '/api/flights/search',
    detailEndpoint: null,
    searchParams: [
      { name: 'origin', type: 'string' as const, description: 'Origin airport code (e.g., JFK, LAX)', required: true },
      { name: 'destination', type: 'string' as const, description: 'Destination airport code', required: true },
      { name: 'departDate', type: 'string' as const, description: 'Departure date (YYYY-MM-DD)', required: true },
      { name: 'returnDate', type: 'string' as const, description: 'Return date for round-trip (YYYY-MM-DD)', required: false },
      { name: 'passengers', type: 'number' as const, description: 'Number of passengers', required: false },
      { name: 'cabinClass', type: 'string' as const, description: 'Cabin class (economy, business, first)', required: false },
    ],
  },
} as const;

export default ecommercePlugin;
