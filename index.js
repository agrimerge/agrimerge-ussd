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
    lang_selection: '1. Kinyarwanda\n2. English\n3. Français',
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
    settings_language: 'Select new language:\n1. Kinyarwanda\n2. English\n3. Français',
    language_updated: 'Your language has been updated.',
    profile_view: 'Your Profile:\nName: {name}\nDistrict: {district}\nPhone: {phone}',
  },
  rw: {
    welcome: 'Murakaza neza kuri AGRIMERGE',
    lang_selection: '1. Kinyarwanda\n2. Icyongereza\n3. Igifaransa',
    main_menu: 'Ahabanza\n1. Gurisha umusaruro\n2. Gura umusaruro\n3. Ibiciro ku isoko\n4. Ikofi & Kwishyura\n5. Inama\n6. Ibyo watumije\n7. Serivisi z\'uwoherejwe\n8. Ubufasha\n9. Igenamiterere\n0. Sohora',
    // ... other translations
  },
  fr: {
    welcome: 'Bienvenue chez AGRIMERGE',
    lang_selection: '1. Kinyarwanda\n2. Anglais\n3. Français',
    main_menu: 'Menu Principal\n1. Vendre des Produits\n2. Acheter des Produits\n3. Prix du Marché\n4. Portefeuille & Paiements\n5. Conseils & Astuces\n6. Mes Commandes\n7. Services Agent\n8. Soutien\n9. Paramètres\n0. Quitter',
    sell_crop_menu: 'Sélectionnez le produit à vendre:\n1. Maïs\n2. Haricots\n3. Pommes de terre',
    buy_crop_menu: 'Sélectionnez le produit à acheter:\n1. Maïs\n2. Haricots\n3. Pommes de terre',
    prices_crop_menu: 'Sélectionnez le produit pour les prix du marché:\n1. Maïs\n2. Haricots\n3. Pommes de terre',
    wallet_menu: 'Portefeuille & Paiements:\n1. Consulter le Solde\n2. Recharger (Mobile Money)\n3. Retirer (Agent)',
    advice_menu: 'Conseils & Astuces:\n1. Poser une Question\n2. Obtenir un Conseil Aléatoire',
    orders_menu: 'Mes Commandes:\n1. Voir les Commandes Récentes',
    agent_login: 'Connexion Agent: Entrez votre PIN Agent:',
    support_menu: 'Soutien:\n1. Signaler un Problème\n2. Demander un Rappel\n3. FAQs',
    settings_menu: 'Paramètres:\n1. Changer de Langue\n2. Voir le Profil',
    exit_message: 'Merci d\'utiliser AGRIMERGE.',
    invalid_option: 'Option invalide. Veuillez réessayer.',
    enter_quantity_kg: 'Entrez la quantité (en kg):',
    enter_price_rwf: 'Entrez le prix unitaire (RWF par kg):',
    select_availability: 'Sélectionnez la disponibilité:\n1. Aujourd\'hui\n2. Dans les 3 jours',
    confirm_listing: 'Confirmer l\'annonce:\nProduit: {crop}\nQté: {quantity} kg\nPrix: {price} RWF/kg\n\n1. Confirmer\n2. Annuler',
    listing_successful: 'Votre annonce pour {quantity}kg de {crop} a été publiée. ID de l\'annonce: {listingId}.',
    listing_cancelled: 'Annonce annulée. Merci.',
    generic_error: 'Une erreur est survenue. Veuillez réessayer.',
    buy_offers: 'Offres pour {crop}:\n1. ID: M1, 250 RWF/kg\n2. ID: M2, 255 RWF/kg\n3. ID: M3, 260 RWF/kg\nEntrez le numéro de l\'offre:',
    buy_confirm_order: 'Confirmer la commande:\n{quantity}kg de {crop} pour {totalPrice} RWF.\n\n1. Confirmer\n2. Annuler',
    buy_payment_choice: 'Choisissez le mode de paiement:\n1. Payer avec le portefeuille\n2. Payer avec Mobile Money',
    order_placed_wallet: 'Une demande de paiement mobile money sera envoyée sur votre téléphone pour finaliser le paiement. ID de commande: {orderId}',
    order_placed_cod: 'Commande passée avec succès. Veuillez payer en espèces à la livraison. ID de commande: {orderId}',
    order_cancelled: 'Commande annulée.',
    prices_subscribe: 'Prix médian pour {crop}: {price} RWF/kg.\nMarchés principaux: Kigali, Musanze.\n\nS\'abonner aux alertes de prix?\n1. Oui\n2. Non',
    subscribed_to_alerts: 'Vous êtes abonné aux alertes de prix pour {crop}.',
    not_subscribed_to_alerts: 'Vous n\'êtes pas abonné. Merci.',
    wallet_balance: 'Le solde de votre portefeuille est de {balance} RWF.',
    wallet_topup: 'Entrez le montant à recharger (RWF):',
    wallet_topup_confirm: 'Une demande de paiement mobile money de {amount} RWF sera envoyée sur votre téléphone.',
    wallet_withdraw: 'Entrez le montant à retirer (RWF):',
    wallet_withdraw_confirm: 'Rendez-vous chez l\'agent le plus proche pour retirer {amount} RWF. Votre code de retrait est {code}.',
    advice_question: 'Veuillez taper votre question:',
    advice_question_confirm: 'Merci pour votre question. Vous recevrez bientôt une réponse par SMS.',
    random_tip: 'AGRI-TIP: Assurez un espacement adéquat entre vos plants de maïs pour maximiser le rendement.',
    orders_view: 'Vos Commandes:\n1. ORD456 (Maïs) - Livrée\n2. ORD457 (Haricots) - En attente\n\n0. Retour',
    agent_menu: 'Menu Agent:\n1. Confirmer la Livraison\n2. Libérer l\'Escroc',
    agent_confirm_delivery: 'Entrez l\'ID de la commande pour confirmer la livraison:',
    agent_delivery_confirmed: 'La livraison de la commande {orderId} a été confirmée. L\'escroc sera libéré au vendeur.',
    support_issue: 'Veuillez décrire brièvement votre problème:',
    support_issue_confirm: 'Merci pour votre signalement. Nous allons l\'examiner.',
    support_callback: 'Entrez votre heure de rappel préférée (ex: 14h):',
    support_callback_confirm: 'Merci. Nous vous rappellerons sous peu.',
    faqs: 'FAQs:\nQ: Comment vendre?\nR: Allez dans Menu Principal > Vendre des Produits.\nQ: Comment suivre ma commande?\nR: Allez dans Menu Principal > Mes Commandes.',
    settings_language: 'Sélectionnez une nouvelle langue:\n1. Kinyarwanda\n2. Anglais\n3. Français',
    language_updated: 'Votre langue a été mise à jour.',
    profile_view: 'Votre Profil:\nNom: {name}\nDistrict: {district}\nTéléphone: {phone}',
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
        if (input === '3') session.lang = 'fr';
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

    // ... (rest of the cases remain the same)

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


