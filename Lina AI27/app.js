/**
 * Application entry point.
 * Bootstraps the UI once the DOM is ready.
 */

import { renderApp } from './ui.js';

function init() {
  renderApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
