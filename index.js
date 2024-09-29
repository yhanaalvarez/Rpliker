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
        const response = await axios.get('https://rplikers-credit-mahiro.onrender.com/api/react', {
            params: {
                cookie: fb_cookie,
                link: post_link,
                react: reaction_type,
            },
        });

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
