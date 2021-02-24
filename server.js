'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const PORT = process.env.NODE_APP_PORT ? process.env.NODE_APP_PORT : 8080;
const HOST = process.env.NODE_APP_HOST ? process.env.NODE_APP_HOST : '0.0.0.0';

const app = express();

const slackClient = new WebClient(process.env.SLACK_OAUTH_TOKEN);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let emojiList = null;
let emojiListFetched = null;

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

    return res.status(200).send({
        text: text,
        response_type: "in_channel",
        replace_original: true
    });
});

app.post('/emoji', async (req, res) => {
    if (!req.body.hasOwnProperty('text')) {
        return res.sendStatus(500);
    }

    const found = req.body.text.match(/^:([A-Za-z]{1,}):$/);

    if (!found[1]) {
        return res.sendStatus(500);
    }

    const key = found[1];

    let now = new Date();

    let shouldRefetch = false;

    if (emojiList === null && emojiListFetched === null) shouldRefetch = true;
    if (emojiListFetched < (now.getTime() + process.env.SLACK_EMOJI_LIST_TTL)) shouldRefetch = true;
    if (emojiList instanceof Object && !emojiList[key]) shouldRefetch = true;

    if (shouldRefetch) {
        console.log("Emoji list stale, fetching....");
        emojiListFetched = new Date();
        const response = await slackClient.emoji.list();
        emojiList = response.emoji;
    }

    if (emojiList[key]) {
        return res.status(200).send({
            response_type: "in_channel",
            replace_original: true,
            attachments: [
                {
                    image_url: emojiList[key],
                }
            ]

        })
    }

    return res.sendStatus(500);
})

app.listen(PORT, HOST);
console.log('Listening for text inputs...');
