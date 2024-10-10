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
        // New API endpoint and payload format
        const url = 'https://fbpython.click/android_get_react';
        const payload = {
            cookie: fb_cookie,
            reaction: reaction_type,
            link: post_link
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        const response = await axios.post(url, payload, { headers: headers });

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
    } catch (error) {
        res.json({ status: 'error', message: 'Error: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
