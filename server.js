'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const config = require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

const slackClient = new WebClient(process.env.SLACK_OAUTH_TOKEN);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', (req, res) => {
    if (!req.body.hasOwnProperty('text')) {
        console.log('Found no field in body called `text`.');
        res.send(500);
    }

    // Get the text value out of the query
    let text = req.body.text;

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

    console.log('Processed `' + req.body.text + '` into `' + text + '`.');

    res.status(200).send({
        text: text,
        response_type: "in_channel",
        replace_original: true
    });
    // res.send(text);
});

app.post('/emoji', async (req, res) => {
    if (!req.body.hasOwnProperty('text')) {
        res.sendStatus(500);
    }

    const found = req.body.text.match(/^:([A-Za-z]{1,}):$/);

    if (found.length < 2) {
        res.sendStatus(500);
    }

    const key = found[1];

    const results = await slackClient.emoji.list();

    if (results.emoji[key]) {
        return res.status(200).send({
            text: results.emoji[key],
            response_type: "in_channel",
            replace_original: true
        })
    }

    res.sendStatus(500);
})

app.listen(PORT, HOST);
console.log('Listening for text inputs...');
