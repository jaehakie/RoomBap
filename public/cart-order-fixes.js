/* Behavioral fixes layered over the unchanged teammate UI and renderers. */
(function () {
  'use strict';
  const originalOpenMenuItem = openMenuItem;
  const originalAddToCart = addToCart;
  const originalCloseDetail = closeDetail;
  let editing = null;

  function notify(code) {
    const messages = {
      en: {
        unavailable: 'This menu or option has changed. Please review your cart.',
        changed: 'The cart item changed while you were editing. Please open it again.',
        limit: 'You can keep up to 10 of the same item and options. Reduce the quantity before saving.',
        updated: 'Cart updated.',
        orderId: 'The demo order could not be created. Your cart is unchanged. Please try again.',
      },
      ja: {
        unavailable: 'メニューまたはオプションが変わりました。カートをご確認ください。',
        changed: '編集中にカートの商品が変わりました。もう一度開いてください。',
        limit: '同じ商品とオプションは10個までです。数量を減らして保存してください。',
        updated: 'カートを更新しました。',
        orderId: 'デモ注文を作成できませんでした。カートは変更されていません。再試行してください。',
      },
      zh: {
        unavailable: '菜单或选项已变更，请检查购物车。',
        changed: '编辑期间购物车商品已变更，请重新打开。',
        limit: '相同商品和选项最多可保留10份，请减少数量后保存。',
        updated: '购物车已更新。',
        orderId: '无法创建模拟订单，购物车未更改，请重试。',
      },
    };
    toast((messages[profile.lang] || messages.en)[code]);
  }

  // A normal menu opening cannot accidentally commit an abandoned edit.
  openMenuItem = function (...args) {
    editing = null;
    return originalOpenMenuItem(...args);
  };

  editCartLine = function (lineId) {
    const line = cart.items.find(item => item.lineId === lineId);
    const item = line && menuData[line.restaurantId]?.items.find(item => item.id === line.itemId);
    if (!line || !item || item.soldOut) { notify('unavailable'); return; }
    editing = {lineId, restaurantId: line.restaurantId, itemId: line.itemId};
    // Open a draft without removing or persisting any existing cart item.
    return originalOpenMenuItem(line.restaurantId, line.itemId, structuredClone(line.selections), line.qty);
  };

  addToCart = function (restaurantId, itemId, selections, qty) {
    const item = menuData[restaurantId]?.items.find(item => item.id === itemId);
    if (!item) { notify('unavailable'); return; }
    const draft = {
      restaurantId, itemId, name: item.name, category: item.category,
      selections: structuredClone(selections), qty,
      unitPrice: selectionPrice(item, selections), key: cartLineKey(itemId, selections),
    };
    if (window.RoomBapCartConflict({restaurantId, items: [draft]}, menuData)) {
      notify('unavailable'); return;
    }
    if (!editing) return originalAddToCart(restaurantId, itemId, selections, qty);

    const original = cart.items.find(line => line.lineId === editing.lineId);
    if (!original || cart.restaurantId !== editing.restaurantId || restaurantId !== editing.restaurantId ||
        itemId !== editing.itemId || original.itemId !== editing.itemId) {
      notify('changed'); return;
    }
    const matching = cart.items.find(line => line.lineId !== original.lineId && line.key === draft.key && line.restaurantId === restaurantId);
    if (matching && matching.qty + qty > 10) { notify('limit'); return; }
    const nextItems = matching
      ? cart.items.filter(line => line.lineId !== original.lineId).map(line => line.lineId === matching.lineId
          ? {...line, ...draft, qty: matching.qty + qty} : line)
      : cart.items.map(line => line.lineId === original.lineId ? {...line, ...draft} : line);

    // Commit only after validation. Editing never adds the old quantity twice.
    cart = {...cart, items: nextItems};
    editing = null;
    put('cart', cart);
    renderCartBadge();
    notify('updated');
    openCart();
  };

  closeDetail = function (...args) {
    editing = null;
    return originalCloseDetail(...args);
  };
  document.querySelector('#detail-close').onclick = closeDetail;
  document.querySelector('#detail').addEventListener('close', () => { editing = null; });

  function uniqueOrderId() {
    // Keep the full UUID; a shortened UUID or timestamp fragment can collide.
    for (let attempt = 0; attempt < 5; attempt++) {
      const id = 'RB-' + globalThis.crypto.randomUUID().toUpperCase();
      if (!orders.some(order => order.id === id)) return id;
    }
    throw new Error('Order ID collision');
  }

  completeOrder = function () {
    // Also reject stale callbacks from a button removed after the first order.
    if (orderSubmitting || editing || !checkoutInfo || !cart.restaurantId || !cart.items.length) return;
    const restaurant = restaurants.find(item => item.id === cart.restaurantId);
    const totals = cartTotals();
    if (!restaurant || totals.belowMin || window.RoomBapCartConflict(cart, menuData)) {
      notify('unavailable'); return;
    }
    let id;
    try { id = uniqueOrderId(); } catch { notify('orderId'); return; }
    orderSubmitting = true;
    const button = document.querySelector('#pay-btn');
    if (button) { button.disabled = true; button.textContent = 'Placing demo order…'; }
    try {
      const order = {
        id, restaurantId: cart.restaurantId, restaurantName: restaurant.en,
        items: cart.items.map(line => ({
          name: line.name, qty: line.qty, unitPrice: line.unitPrice,
          options: selectionSummary(menuData[line.restaurantId].items.find(item => item.id === line.itemId), line.selections),
        })),
        itemsTotal: totals.itemsTotal, deliveryFee: totals.deliveryFee, total: totals.total,
        room: checkoutInfo.room, pickup: checkoutInfo.pickup.label,
        name: checkoutInfo.name, phone: checkoutInfo.phoneCode + ' ' + checkoutInfo.phone,
        restaurantNote: checkoutInfo.restaurantNote, receivingNote: checkoutInfo.receivingNote,
        cutlery: checkoutInfo.cutlery,
        payment: (paymentMethods.find(item => item.id === selectedPayment) || {}).label,
        time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}), stage: 0,
      };
      orders.unshift(order);
      put('orders', orders);
      cart = {restaurantId: null, items: []};
      put('cart', cart);
      checkoutInfo = null;
      renderCartBadge();
      showOrder(order);
    } finally { orderSubmitting = false; }
  };
})();
