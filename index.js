const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');

// --- Redis Connection ---
const redis = new Redis({
  host: 'normal-hen-16590.upstash.io',
  port: 6379,
  password: 'AUDOAAIncDJiNTljNTUyMGEyZTQ0ZTk5YWI3MzViOWVlMTNiY2FmMHAyMTY1OTA',
  tls: {}, // Required for secure connection
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => console.log('Redis connected successfully.'));
redis.on('error', (err) => console.error('Redis connection error:', err));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Localization / Internationalization (i18n) ---
const locales = {
  en: {
    welcome: 'Welcome to AGRIMERGE',
    lang_selection: '1. Kinyarwanda\n2. English\n3. Swahili',
    main_menu: 'Main Menu\n1. Sell Produce\n2. Buy Produce\n3. Market Prices\n4. Wallet & Payments\n5. Advice & Tips\n6. My Orders\n7. Agent Services\n8. Support\n9. Settings\n0. Exit',
    sell_crop_menu: 'Select crop to sell:\n1. Maize\n2. Beans\n3. Irish Potatoes',
    buy_crop_menu: 'Select crop to buy:\n1. Maize\n2. Beans\n3. Irish Potatoes',
    prices_crop_menu: 'Select crop for market prices:\n1. Maize\n2. Beans\n3. Irish Potatoes',
    wallet_menu: 'Wallet & Payments:\n1. Check Balance\n2. Top-up (Mobile Money)\n3. Withdraw (Agent)',
    advice_menu: 'Advice & Tips:\n1. Ask a Question\n2. Get a Random Tip',
    orders_menu: 'My Orders:\n1. View Recent Orders',
    agent_login: 'Agent Login: Enter your Agent PIN:',
    support_menu: 'Support:\n1. Report an Issue\n2. Request a Callback\n3. FAQs',
    settings_menu: 'Settings:\n1. Change Language\n2. View Profile',
    exit_message: 'Thank you for using AGRIMERGE.',
    invalid_option: 'Invalid option. Please try again.',
    enter_quantity_kg: 'Enter quantity (in kg):',
    enter_price_rwf: 'Enter unit price (RWF per kg):',
    select_availability: 'Select availability:\n1. Today\n2. Within 3 days',
    confirm_listing: 'Confirm Listing:\nCrop: {crop}\nQty: {quantity} kg\nPrice: {price} RWF/kg\n\n1. Confirm\n2. Cancel',
    listing_successful: 'Your listing for {quantity}kg of {crop} has been posted. Listing ID: {listingId}.',
    listing_cancelled: 'Listing cancelled. Thank you.',
    generic_error: 'An error occurred. Please try again.',
    buy_offers: 'Offers for {crop}:\n1. ID: M1, 250 RWF/kg\n2. ID: M2, 255 RWF/kg\n3. ID: M3, 260 RWF/kg\nEnter Offer Number:',
    buy_confirm_order: 'Confirm Order:\n{quantity}kg of {crop} for {totalPrice} RWF.\n\n1. Confirm\n2. Cancel',
    buy_payment_choice: 'Choose payment method:\n1. Pay with Wallet\n2. Pay with Mobile Money',
    order_placed_wallet: 'A mobile money payment prompt will be sent to your phone to complete the payment. Order ID: {orderId}',
    order_placed_cod: 'Order placed successfully. Please pay cash on delivery. Order ID: {orderId}',
    order_cancelled: 'Order cancelled.',
    prices_subscribe: 'Median price for {crop}: {price} RWF/kg.\nTop markets: Kigali, Musanze.\n\nSubscribe to price alerts?\n1. Yes\n2. No',
    subscribed_to_alerts: 'You have been subscribed to price alerts for {crop}.',
    not_subscribed_to_alerts: 'You have not been subscribed. Thank you.',
    wallet_balance: 'Your wallet balance is {balance} RWF.',
    wallet_topup: 'Enter amount to top-up (RWF):',
    wallet_topup_confirm: 'A mobile money prompt for {amount} RWF will be sent to your phone.',
    wallet_withdraw: 'Enter amount to withdraw (RWF):',
    wallet_withdraw_confirm: 'Visit your nearest agent to withdraw {amount} RWF. Your withdrawal code is {code}.',
    advice_question: 'Please type your question:',
    advice_question_confirm: 'Thank you for your question. You will receive an SMS with an answer shortly.',
    random_tip: 'AGRI-TIP: Ensure proper spacing between your maize plants to maximize yield.',
    orders_view: 'Your Orders:\n1. ORD456 (Maize) - Delivered\n2. ORD457 (Beans) - Pending\n\n0. Back',
    agent_menu: 'Agent Menu:\n1. Confirm Delivery\n2. Release Escrow',
    agent_confirm_delivery: 'Enter the Order ID to confirm delivery:',
    agent_delivery_confirmed: 'Delivery for order {orderId} has been confirmed. Escrow will be released to the seller.',
    support_issue: 'Please describe your issue briefly:',
    support_issue_confirm: 'Thank you for your report. We will look into it.',
    support_callback: 'Enter your preferred callback time (e.g., 2pm):',
    support_callback_confirm: 'Thank you. We will call you back shortly.',
    faqs: 'FAQs:\nQ: How do I sell?\nA: Go to Main Menu > Sell Produce.\nQ: How do I track my order?\nA: Go to Main Menu > My Orders.',
    settings_language: 'Select new language:\n1. Kinyarwanda\n2. English\n3. Swahili',
    language_updated: 'Your language has been updated.',
    profile_view: 'Your Profile:\nName: {name}\nDistrict: {district}\nPhone: {phone}',
  },
  rw: {
    // Kinyarwanda translations...
  },
  sw: {
    // Swahili translations...
  },
};

const t = (lang, key, params = {}) => {
  let text = locales[lang]?.[key] || locales.en[key];
  for (const key in params) {
    text = text.replace(new RegExp(`{${key}}`, 'g'), params[key]);
  }
  return text;
};

app.get('/', (req, res) => {
  res.send('✅ Agrimerge USSD server is running!');
});

app.post('/api/ussd/webhook', async (req, res) => {
  try {
    const { sessionId, phoneNumber, text } = req.body;
    const input = text.split('*').pop();

    let session = JSON.parse(await redis.get(`session:${sessionId}`) || 'null');
    if (!session) {
      session = { phone: phoneNumber, stage: 'LANG_SELECTION', lang: 'en', data: {} };
    }

    const response = await handleUSSD(session, input, phoneNumber);

    await redis.set(`session:${sessionId}`, JSON.stringify(response.session), 'EX', 180);

    res.set('Content-Type', 'text/plain');
    res.send(`${response.type} ${response.message}`);

  } catch (error) {
    console.error('Fatal Error:', error);
    res.set('Content-Type', 'text/plain');
    res.send('END An unexpected error occurred. Please try again later.');
  }
});

async function handleUSSD(session, input, phoneNumber) {
  let responseMessage = '';
  let responseType = 'CON';
  const lang = session.lang || 'en';

  switch (session.stage) {
    case 'LANG_SELECTION':
      if (input === '') {
        responseMessage = `${t('en', 'welcome')}\n${t('en', 'lang_selection')}`;
      } else {
        if (input === '1') session.lang = 'rw';
        if (input === '2') session.lang = 'en';
        if (input === '3') session.lang = 'sw';
        session.stage = 'MAIN_MENU';
        responseMessage = t(session.lang, 'main_menu');
      }
      break;

    case 'MAIN_MENU':
      switch (input) {
        case '1': session.stage = 'SELL_CROP_MENU'; responseMessage = t(lang, 'sell_crop_menu'); break;
        case '2': session.stage = 'BUY_CROP_MENU'; responseMessage = t(lang, 'buy_crop_menu'); break;
        case '3': session.stage = 'PRICES_CROP_MENU'; responseMessage = t(lang, 'prices_crop_menu'); break;
        case '4': session.stage = 'WALLET_MENU'; responseMessage = t(lang, 'wallet_menu'); break;
        case '5': session.stage = 'ADVICE_MENU'; responseMessage = t(lang, 'advice_menu'); break;
        case '6': session.stage = 'ORDERS_MENU'; responseMessage = t(lang, 'orders_menu'); break;
        case '7': session.stage = 'AGENT_LOGIN'; responseMessage = t(lang, 'agent_login'); break;
        case '8': session.stage = 'SUPPORT_MENU'; responseMessage = t(lang, 'support_menu'); break;
        case '9': session.stage = 'SETTINGS_MENU'; responseMessage = t(lang, 'settings_menu'); break;
        case '0': responseType = 'END'; responseMessage = t(lang, 'exit_message'); break;
        default: responseMessage = `${t(lang, 'invalid_option')}\n${t(lang, 'main_menu')}`; break;
      }
      break;

    // ... (Sell flow remains the same)

    case 'BUY_CROP_MENU':
      const buy_crops = { '1': 'Maize', '2': 'Beans', '3': 'Irish Potatoes' };
      if (buy_crops[input]) {
        session.data.buy_crop = buy_crops[input];
        session.stage = 'BUY_LIST_OFFERS';
        responseMessage = t(lang, 'buy_offers', { crop: session.data.buy_crop });
      } else {
        responseMessage = `${t(lang, 'invalid_option')}\n${t(lang, 'buy_crop_menu')}`;
      }
      break;

    case 'BUY_LIST_OFFERS':
      const offers = { '1': { id: 'M1', price: 250 }, '2': { id: 'M2', price: 255 }, '3': { id: 'M3', price: 260 } };
      if (offers[input]) {
        session.data.buy_offer = offers[input];
        session.stage = 'BUY_QUANTITY';
        responseMessage = t(lang, 'enter_quantity_kg');
      } else {
        responseMessage = t(lang, 'invalid_option');
      }
      break;

    case 'BUY_QUANTITY':
      if (!isNaN(input) && Number(input) > 0) {
        session.data.buy_quantity = Number(input);
        session.stage = 'BUY_CONFIRM_ORDER';
        const totalPrice = session.data.buy_offer.price * session.data.buy_quantity;
        session.data.buy_total_price = totalPrice;
        responseMessage = t(lang, 'buy_confirm_order', {
          quantity: session.data.buy_quantity,
          crop: session.data.buy_crop,
          totalPrice: totalPrice,
        });
      } else {
        responseMessage = t(lang, 'invalid_option');
      }
      break;

    case 'BUY_CONFIRM_ORDER':
      if (input === '1') {
        session.stage = 'BUY_PAYMENT_CHOICE';
        responseMessage = t(lang, 'buy_payment_choice');
      } else if (input === '2') {
        responseType = 'END';
        responseMessage = t(lang, 'order_cancelled');
        session.data = {};
        session.stage = 'MAIN_MENU';
      } else {
        responseMessage = t(lang, 'invalid_option');
      }
      break;

    case 'BUY_PAYMENT_CHOICE':
      const orderId = `MOCKORD${Math.floor(1000 + Math.random() * 9000)}`;
      if (input === '1') {
        responseType = 'END';
        responseMessage = t(lang, 'order_placed_wallet', { orderId });
        session.data = {};
        session.stage = 'MAIN_MENU';
      } else if (input === '2') {
        responseType = 'END';
        responseMessage = t(lang, 'order_placed_cod', { orderId });
        session.data = {};
        session.stage = 'MAIN_MENU';
      } else {
        responseMessage = t(lang, 'invalid_option');
      }
      break;

    case 'PRICES_CROP_MENU':
      const prices_crops = { '1': 'Maize', '2': 'Beans', '3': 'Irish Potatoes' };
      if (prices_crops[input]) {
        session.data.prices_crop = prices_crops[input];
        session.stage = 'PRICES_SUBSCRIBE';
        const medianPrice = 255; // Mocked
        responseMessage = t(lang, 'prices_subscribe', { crop: session.data.prices_crop, price: medianPrice });
      } else {
        responseMessage = `${t(lang, 'invalid_option')}\n${t(lang, 'prices_crop_menu')}`;
      }
      break;

    case 'PRICES_SUBSCRIBE':
      if (input === '1') {
        responseType = 'END';
        responseMessage = t(lang, 'subscribed_to_alerts', { crop: session.data.prices_crop });
        session.data = {};
        session.stage = 'MAIN_MENU';
      } else if (input === '2') {
        responseType = 'END';
        responseMessage = t(lang, 'not_subscribed_to_alerts');
        session.data = {};
        session.stage = 'MAIN_MENU';
      } else {
        responseMessage = t(lang, 'invalid_option');
      }
      break;

    case 'WALLET_MENU':
      switch (input) {
        case '1':
          const balance = 5000; // Mocked
          responseType = 'END';
          responseMessage = t(lang, 'wallet_balance', { balance });
          session.stage = 'MAIN_MENU';
          break;
        case '2':
          session.stage = 'WALLET_TOPUP';
          responseMessage = t(lang, 'wallet_topup');
          break;
        case '3':
          session.stage = 'WALLET_WITHDRAW';
          responseMessage = t(lang, 'wallet_withdraw');
          break;
        default:
          responseMessage = `${t(lang, 'invalid_option')}\n${t(lang, 'wallet_menu')}`;
          break;
      }
      break;

    case 'WALLET_TOPUP':
      if (!isNaN(input) && Number(input) > 0) {
        const topupAmount = Number(input);
        responseType = 'END';
        responseMessage = t(lang, 'wallet_topup_confirm', { amount: topupAmount });
        session.stage = 'MAIN_MENU';
      } else {
        responseMessage = t(lang, 'invalid_option');
      }
      break;

    case 'WALLET_WITHDRAW':
      if (!isNaN(input) && Number(input) > 0) {
        const withdrawAmount = Number(input);
        const code = `MOCKWID${Math.floor(1000 + Math.random() * 9000)}`;
        responseType = 'END';
        responseMessage = t(lang, 'wallet_withdraw_confirm', { amount: withdrawAmount, code });
        session.stage = 'MAIN_MENU';
      } else {
        responseMessage = t(lang, 'invalid_option');
      }
      break;

    case 'ADVICE_MENU':
      switch (input) {
        case '1':
          session.stage = 'ADVICE_QUESTION';
          responseMessage = t(lang, 'advice_question');
          break;
        case '2':
          responseType = 'END';
          responseMessage = t(lang, 'random_tip');
          session.stage = 'MAIN_MENU';
          break;
        default:
          responseMessage = `${t(lang, 'invalid_option')}\n${t(lang, 'advice_menu')}`;
          break;
      }
      break;

    case 'ADVICE_QUESTION':
      responseType = 'END';
      responseMessage = t(lang, 'advice_question_confirm');
      session.stage = 'MAIN_MENU';
      break;

    case 'ORDERS_MENU':
      if (input === '1') {
        session.stage = 'ORDERS_VIEW';
        responseMessage = t(lang, 'orders_view');
      } else {
        responseMessage = `${t(lang, 'invalid_option')}\n${t(lang, 'orders_menu')}`;
      }
      break;

    case 'ORDERS_VIEW':
      if (input === '0') {
        session.stage = 'MAIN_MENU';
        responseMessage = t(lang, 'main_menu');
      } else {
        responseType = 'END';
        responseMessage = t(lang, 'exit_message');
        session.stage = 'MAIN_MENU';
      }
      break;

    case 'AGENT_LOGIN':
      if (input === '1234') { // Mock PIN
        session.stage = 'AGENT_MENU';
        responseMessage = t(lang, 'agent_menu');
      } else {
        responseType = 'END';
        responseMessage = t(lang, 'invalid_option');
        session.stage = 'MAIN_MENU';
      }
      break;

    case 'AGENT_MENU':
      if (input === '1') {
        session.stage = 'AGENT_CONFIRM_DELIVERY';
        responseMessage = t(lang, 'agent_confirm_delivery');
      } else {
        responseType = 'END';
        responseMessage = t(lang, 'generic_error');
        session.stage = 'MAIN_MENU';
      }
      break;

    case 'AGENT_CONFIRM_DELIVERY':
      const orderIdToConfirm = input;
      responseType = 'END';
      responseMessage = t(lang, 'agent_delivery_confirmed', { orderId: orderIdToConfirm });
      session.stage = 'MAIN_MENU';
      break;

    case 'SUPPORT_MENU':
      switch (input) {
        case '1':
          session.stage = 'SUPPORT_ISSUE';
          responseMessage = t(lang, 'support_issue');
          break;
        case '2':
          session.stage = 'SUPPORT_CALLBACK';
          responseMessage = t(lang, 'support_callback');
          break;
        case '3':
          responseType = 'END';
          responseMessage = t(lang, 'faqs');
          session.stage = 'MAIN_MENU';
          break;
        default:
          responseMessage = `${t(lang, 'invalid_option')}\n${t(lang, 'support_menu')}`;
          break;
      }
      break;

    case 'SUPPORT_ISSUE':
      responseType = 'END';
      responseMessage = t(lang, 'support_issue_confirm');
      session.stage = 'MAIN_MENU';
      break;

    case 'SUPPORT_CALLBACK':
      responseType = 'END';
      responseMessage = t(lang, 'support_callback_confirm');
      session.stage = 'MAIN_MENU';
      break;

    case 'SETTINGS_MENU':
      switch (input) {
        case '1':
          session.stage = 'SETTINGS_LANGUAGE';
          responseMessage = t(lang, 'settings_language');
          break;
        case '2':
          const userProfile = { name: 'Jean', district: 'Gasabo' }; // Mocked
          responseType = 'END';
          responseMessage = t(lang, 'profile_view', { name: userProfile.name, district: userProfile.district, phone: phoneNumber });
          session.stage = 'MAIN_MENU';
          break;
        default:
          responseMessage = `${t(lang, 'invalid_option')}\n${t(lang, 'settings_menu')}`;
          break;
      }
      break;

    case 'SETTINGS_LANGUAGE':
      if (input === '1') session.lang = 'rw';
      if (input === '2') session.lang = 'en';
      if (input === '3') session.lang = 'sw';
      responseType = 'END';
      responseMessage = t(session.lang, 'language_updated');
      session.stage = 'MAIN_MENU';
      break;

    default:
      responseType = 'END';
      responseMessage = t(lang, 'generic_error');
      session.stage = 'MAIN_MENU';
      break;
  }

  return {
    session: session,
    type: responseType,
    message: responseMessage,
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD webhook server listening on port ${PORT}`);
});
