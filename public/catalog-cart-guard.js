/* Preserve saved cart contents, but require review if current menu data differs. */
(function () {
  'use strict';
  const checkoutButtons = new Set(['go-checkout-btn', 'go-payment-btn', 'pay-btn']);
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !checkoutButtons.has(button.id)) return;
    const conflict = window.RoomBapCartConflict(cart, window.RoomBapMenuData);
    if (!conflict) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const messages = {
      ko: '장바구니의 메뉴·가격·옵션 정보가 변경됐어요. 해당 항목을 삭제하고 다시 선택해 주세요.',
      en: 'A cart menu, price or option has changed. Remove that item and select it again.',
      ja: 'カートのメニュー・価格・オプションが変わりました。該当商品を削除して再度選択してください。',
      zh: '购物车中的菜单、价格或选项已变更，请删除相应商品并重新选择。',
    };
    toast(messages[profile.lang] || messages.en);
  }, true);
})();
