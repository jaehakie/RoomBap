/* Same-origin API client. Provider credentials never enter the browser. */
(function () {
  'use strict';
  async function request(path, body, signal) {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener('abort', cancel, {once: true});
    let timedOut = false;
    const timer = setTimeout(() => {timedOut = true; controller.abort();}, 65000);
    try {
      const headers = body ? {'Content-Type': 'application/json'} : {};
      if (window.RoomBapCatalogVersion) headers['X-RoomBap-Catalog-Version'] = window.RoomBapCatalogVersion;
      const response = await fetch(path, {method: body ? 'POST' : 'GET',
        headers,
        body: body ? JSON.stringify(body) : undefined, signal: controller.signal});
      const data = await response.json();
      if (response.ok && window.RoomBapCatalogVersion && data.catalog_version !== window.RoomBapCatalogVersion) {
        const error = new Error('RoomBap menu catalog changed');
        error.status = 409;
        error.detail = {code: 'catalog_version_mismatch'};
        throw error;
      }
      if (!response.ok) {
        const error = new Error('RoomBap request failed');
        error.status = response.status;
        error.detail = data.detail;
        throw error;
      }
      return data;
    } catch (error) {
      if (timedOut) error.code = 'timeout';
      throw error;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
    }
  }
  window.RoomBapAIClient = Object.freeze({
    health: signal => request('/health', null, signal),
    topics: signal => request('/api/trends', null, signal),
    recommend: (body, signal) => request('/api/food-finder', body, signal),
    answer: (body, signal) => request('/api/trends/answer', body, signal),
    match: (body, signal) => request('/api/food-finder/trends/match', body, signal),
  });
})();
