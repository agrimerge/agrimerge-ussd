


const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sessions = {};

const locales = {
    '2': JSON.parse(fs.readFileSync('./locales/en.json')),
    '3': JSON.parse(fs.readFileSync('./locales/fr.json')),
    '1': JSON.parse(fs.readFileSync('./locales/rw.json'))
};

app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    let response = '';

    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            language: null,
            step: 'language_select'
        };
    }

    let session = sessions[sessionId];
    let textParts = text.split('*');
    let userResponse = textParts[textParts.length - 1];

    if (session.step === 'language_select') {
        if (text === '') {
            response = `CON Welcome to Agrimerge\n1. Kinyarwanda\n2. English\n3. French`;
        } else {
            if (locales[userResponse]) {
                session.language = userResponse;
                session.step = 'main_menu';
                let t = locales[session.language];
                response = `CON ${t.main_menu}\n1. ${t.options['1']}\n2. ${t.options['2']}\n3. ${t.options['3']}`;
            } else {
                response = `CON Invalid language selection.\n1. Kinyarwanda\n2. English\n3. French`;
            }
        }
    } else {
        let t = locales[session.language];
        let currentStep = textParts.length > 1 ? textParts[1] : '';

        if (session.step === 'main_menu') {
            if (userResponse === '1') { // Buy
                session.step = 'buy_menu';
                response = `CON ${t.buy_menu}\n1. ${t.items['1']}\n2. ${t.items['2']}\n3. ${t.items['3']}\n4. ${t.items['4']}`;
            } else if (userResponse === '2') { // Sell
                session.step = 'sell_menu';
                response = `CON ${t.sell_menu}\n1. ${t.items['1']}\n2. ${t.items['2']}\n3. ${t.items['3']}\n4. ${t.items['4']}`;
            } else if (userResponse === '3') { // Weather
                session.step = 'weather';
                response = `END ${t.weather_forecast}`;
                delete sessions[sessionId];
            } else {
                response = `CON ${t.invalid_option}\n1. ${t.options['1']}\n2. ${t.options['2']}\n3. ${t.options['3']}`;
            }
        } else if (session.step === 'buy_menu' || session.step === 'sell_menu') {
            let item = t.items[userResponse];
            if (item) {
                session.step = 'kg_prompt';
                session.item = item;
                response = `CON ${t.kg_prompt}`;
            } else {
                response = `CON ${t.invalid_option}\n1. ${t.items['1']}\n2. ${t.items['2']}\n3. ${t.items['3']}\n4. ${t.items['4']}`;
            }
        } else if (session.step === 'kg_prompt') {
            session.kg = userResponse;
            response = `END ${t.thank_you}`;
            console.log('Session:', session);
            delete sessions[sessionId];
        } else {
            response = `END ${t.invalid_option}`;
            delete sessions[sessionId];
        }
    }

    res.set('Content-Type: text/plain');
    res.send(response);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
