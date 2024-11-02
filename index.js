const express = require('express');
const axios = require('axios'); 
const rateLimit = require('express-rate-limit'); // Import express-rate-limit
const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting middleware
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 1 menit
    max: 100, // Maksimum 100 permintaan per IP
    message: { error: "Too many requests, please try again later." }
});

// Menggunakan middleware di semua rute
app.use(limiter);

app.get('/api/content', async (req, res) => { 
    const { url } = req.query;

    if (!url) { 
        return res.json({ "error": "You need a valid URL parameter" });
    }

    let rawUrl;

    // Memvalidasi dan mengonversi URL
    if (url.startsWith('https://gist.github.com/')) {
        const parts = url.replace('https://gist.github.com/', '').split('/');
        if (parts.length >= 2) {
            const username = parts[0];
            const gistId = parts[1];
            rawUrl = `https://gist.githubusercontent.com/${username}/${gistId}/raw/`;
        } else {
            return res.json({ "error": "Invalid Gist URL format" });
        }
    } else if (url.startsWith('https://paste.ee/p/')) {
        const pasteId = url.replace('https://paste.ee/p/', '');
        rawUrl = `https://paste.ee/r/${pasteId}`;
    } else if (url.startsWith('https://dpaste.com/')) {
        const pasteId = url.replace('https://dpaste.com/', '').replace('.txt', '');
        rawUrl = `https://dpaste.com/${pasteId}.txt`;
    } else if (url.startsWith('https://ghostbin.site/')) {
        const pasteId = url.replace('https://ghostbin.site/', '');
        rawUrl = `https://ghostbin.site/${pasteId}/raw`;
    } else if (url.startsWith('http://pastie.org/p/')) {
        const pasteId = url.replace('http://pastie.org/p/', '');
        rawUrl = `http://pastie.org/p/${pasteId}/raw`;
    } else {
        return res.json({ "error": "Unsupported URL" });
    }

    try {
        const response = await axios.get(rawUrl);
        res.json({ "result": response.data });
    } catch (error) {
        res.status(500).json({ "error": "Failed to fetch content" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
