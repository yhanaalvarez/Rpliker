const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/react', async (req, res) => {
    const { post_link, reaction_type, fb_cookie } = req.body;

    try {
        const url = 'https://fbpython.click/android_get_react';
        const payload = {
            reaction: reaction_type,
            cookie: fb_cookie,
            link: post_link,
            version: "2.1"
        };

        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'User-Agent': 'okhttp/3.9.1'
        };

        const response = await axios.post(url, payload, { headers: headers });

        if (response.status === 200) {
            const responseData = response.data;
            if (responseData.status === 'success') {
                res.json({ status: 'success', message: responseData.message });
            } else if (responseData.status === 'cooldown') {
                res.json({
                    status: 'cooldown',
                    message: responseData.message,
                    cooldown: true,
                });
            } else if (responseData.status === 'failed' && responseData.status_cookie === 'UNKEEP') {
                res.json({
                    status: 'expired',
                    message: responseData.message,
                    expired: true,
                });
            } else {
                res.json({ status: 'error', message: 'Failed to send reaction. Response: ' + JSON.stringify(responseData) });
            }
        } else {
            res.json({ status: 'error', message: 'Request failed with status code: ' + response.status });
        }
    } catch (error) {
        res.json({ status: 'error', message: 'Error: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
