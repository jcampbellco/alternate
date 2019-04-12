'use strict';

const express = require('express');

const PORT = 80;
const HOST = '0.0.0.0';

const app = express();

app.post('/', (req, res) => {
    if (!req.query.hasOwnProperty('text')) {
        res.send(500);
    }

    // Get the text value out of the query
    let text = req.query.text;

    // Convert the text to lowercase
    text = text.toLowerCase();

    // Explode the text into an array
    text = text.split('');

    // Alternate the case
    for (let i = 0; i <= (text.length - 1); i++) {
        if (i % 2 === 0) {
            text[i] = text[i].toUpperCase();
        }
    }

    // Rejoin it
    text = text.join('');

    console.log('Processed `' + req.query.text + '` into `' + text + '`.');
    res.send(text);
});

app.listen(PORT, HOST);
console.log('Listening for text inputs...');