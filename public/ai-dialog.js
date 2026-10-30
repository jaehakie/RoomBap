(function () {
  'use strict';
  const dialog = document.getElementById('ai-dialog');
  const launcher = document.getElementById('ai-launcher');
  const closeButton = document.getElementById('ai-close');
  const names = {
    ko: ['AI 메뉴 추천 열기', 'AI 추천 닫기'],
    en: ['Open AI meal finder', 'Close AI meal finder'],
    ja: ['AI料理検索を開く', 'AI料理検索を閉じる'],
    zh: ['打开AI美食推荐', '关闭AI美食推荐'],
  };
  function updateLabels() {
    const labels = names[window.RoomBapApp.getPreferences().lang] || names.en;
    launcher.setAttribute('aria-label', labels[0]);
    launcher.title = labels[0];
    closeButton.setAttribute('aria-label', labels[1]);
  }
  launcher.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.showModal();
    launcher.setAttribute('aria-expanded', 'true');
    const input = dialog.querySelector('[role="tabpanel"]:not([hidden]) input');
    input?.focus({preventScroll: true});
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')]
      .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length > 0);
    const first = focusable[0], last = focusable.at(-1);
    if (!first) return;
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    launcher.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('dialog[open]')) launcher.focus({preventScroll: true});
  });
  window.addEventListener('roombap:open-menu', () => {
    if (dialog.open) dialog.close();
  });
  window.addEventListener('roombap:preferences', updateLabels);
  updateLabels();
})();
