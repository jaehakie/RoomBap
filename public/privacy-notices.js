/* Keep the teammate layout; update notices to describe the connected AI features. */
(function () {
  'use strict';
  const notices = {
    en: {
      survey: 'Your preferences are saved in this browser session. When you request recommendations, your dietary and allergy choices are sent to our server to check menu conditions. You can change them anytime.',
      ai: 'Your question is sent to Claude, an external AI service, to prepare a response. Please do not enter personal information such as your name or phone number.',
      help: ['A LITTLE HELP', 'Make yourself at home.',
        'Do I need a Korean phone number?', 'No. This demo starts with your stay already selected.',
        'Can I change my food preferences?', 'Yes. Use the settings button at the top. You can close any survey step with × or skip it.',
        'How is AI used?', 'AI meal finding and K-food trend explanations use Claude. When you request recommendations, saved preferences are checked by our server. Questions you type are sent to Claude for analysis or answers. The name and phone number entered at checkout are not automatically attached to AI requests.',
        'Is this a real order?', 'This is an interactive prototype. Orders, payment and delivery are simulated. No payment is charged and no order is sent to a restaurant.',
        'What about allergies?', 'Selecting allergies or dietary preferences does not guarantee that a menu is safe for you. Ingredient information may be incomplete, and shared kitchens can cause cross-contact. Confirm ingredients and preparation with the restaurant before a real purchase.'],
    },
    ja: {
      survey: '好みはこのブラウザのセッションに保存されます。料理の推薦をリクエストすると、食事・アレルギーの選択情報がサーバーに送信され、メニューの条件確認に使われます。いつでも変更できます。',
      ai: '入力した質問は、回答のため外部AIサービスのClaudeに送信されます。氏名や電話番号などの個人情報は入力しないでください。',
      help: ['ご利用ガイド', '滞在先でも、くつろいで。',
        '韓国の電話番号は必要ですか？', 'いいえ。このデモでは滞在先があらかじめ選択されています。',
        '食事の好みは変更できますか？', 'はい。画面上部の設定ボタンから変更できます。各ステップは×で閉じるか、スキップできます。',
        'AIはどのように使われますか？', 'AIによる料理検索と韓国の話題のグルメの説明にClaudeを使用します。推薦をリクエストすると、保存した好みをサーバーで確認します。入力した質問は、分析や回答のためClaudeに送信されます。注文画面の氏名・電話番号がAIへのリクエストに自動で追加されることはありません。',
        '実際に注文されますか？', 'これは体験用の試作品です。注文・決済・配達はシミュレーションで、料金の請求や店舗への注文送信はありません。',
        'アレルギーについては？', 'アレルギーや食事条件を選択しても、料理の安全性は保証されません。食材情報が不十分な場合や、調理中に交差接触が起きる場合があります。実際の購入前に、食材と調理方法を店舗に確認してください。'],
    },
    zh: {
      survey: '偏好保存在当前浏览器会话中。请求推荐时，饮食和过敏选项会发送到我们的服务器，用于核对菜单条件。您可以随时修改。',
      ai: '您输入的问题会发送给外部AI服务Claude以生成回复。请勿输入姓名、电话号码等个人信息。',
      help: ['使用帮助', '让旅途中的一餐更自在。',
        '需要韩国电话号码吗？', '不需要。本演示已预先选定住宿地点。',
        '可以修改饮食偏好吗？', '可以。使用页面顶部的设置按钮即可修改。每个步骤都可以点击×关闭或跳过。',
        'AI如何使用这些信息？', 'AI美食推荐和韩国热门美食介绍使用Claude。请求推荐时，我们的服务器会核对已保存的偏好。您输入的问题会发送给Claude进行分析或生成回答。下单页面的姓名和电话号码不会自动附加到AI请求中。',
        '这是真实订单吗？', '这是交互式原型。订单、付款和配送均为模拟，不会扣款，也不会向餐厅发送订单。',
        '食物过敏怎么办？', '选择过敏或饮食条件并不能保证菜单适合您安全食用。食材资料可能不完整，共用厨房也可能发生交叉接触。实际购买前，请向餐厅确认食材和制作方式。'],
    },
  };
  const current = () => notices[profile.lang] || notices.en;
  for (const [language, text] of Object.entries(notices)) copy[language].privacy = text.survey;

  function updateNotices() {
    const text = current();
    // renderSurvey also reads the updated copy when changing language within the survey.
    document.querySelector('#privacy-note').textContent = notices[draft?.lang || profile.lang]?.survey || notices.en.survey;
    document.querySelector('#ai-food-privacy').textContent = text.ai;
    document.querySelector('#ai-trend-privacy').textContent = text.ai;
  }
  document.querySelector('[data-nav="help"]').onclick = () => {
    const [kicker, title, ...entries] = current().help;
    let html = `<p class="detail-kicker">${escapeHTML(kicker)}</p><h2 class="detail-title" id="detail-title">${escapeHTML(title)}</h2>`;
    for (let i = 0; i < entries.length; i += 2) html += `<p class="field-label">${escapeHTML(entries[i])}</p><p class="detail-description">${escapeHTML(entries[i + 1])}</p>`;
    detail(html);
  };
  window.addEventListener('roombap:preferences', updateNotices);
  updateNotices();
})();
