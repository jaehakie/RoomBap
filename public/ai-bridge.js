/* Connect the original UI to the AI module without changing its design code. */
(function () {
  'use strict';
  window.RoomBapApp = Object.freeze({
    getPreferences: () => structuredClone(profile),
    getRestaurants: () => restaurants,
    getMenuData: () => menuData,
    getHotelId: () => 'hongdae-stay',
    openMenu: (restaurantId, itemId) => {
      const item = menuData[restaurantId]?.items.find(value => value.id === itemId);
      if (!item || item.soldOut) return false;
      window.dispatchEvent(new CustomEvent('roombap:open-menu'));
      openMenuItem(restaurantId, itemId);
      return true;
    },
  });
  document.querySelector('#survey').addEventListener('close', () => {
    window.dispatchEvent(new CustomEvent('roombap:preferences'));
  });
})();
