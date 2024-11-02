const express = require('express');
const axios = require('axios'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/content', async (req, res) => { 
    const { url } = req.query;

    if (!url || 
        (!url.startsWith('https://gist.github.com/') && 
         !url.startsWith('https://dpaste.com/') && 
         !url.startsWith('https://ghostbin.site/') && 
         !url.startsWith('http://pastie.org/p/') &&
         !url.startsWith('https://pastefs.com/'))) { 
        return res.json({ "error": "You need a valid URL parameter" });
    }

    let rawUrl;

    if (url.startsWith('https://gist.github.com/')) {
        const parts = url.replace('https://gist.github.com/', '').split('/');
        if (parts.length >= 2) {
            const username = parts[0];
            const gistId = parts[1];
            rawUrl = `https://gist.githubusercontent.com/${username}/${gistId}/raw/`;
        } else {
            return res.json({ "error": "Invalid Gist URL format" });
        }
    } else if (url.startsWith('https://dpaste.com/')) {
        const pasteId = url.replace('https://dpaste.com/', '');
        rawUrl = `https://dpaste.com/${pasteId}.txt`;
    } else if (url.startsWith('https://ghostbin.site/')) {
        const ghostbinId = url.replace('https://ghostbin.site/', '');
        rawUrl = `https://ghostbin.site/${ghostbinId}/raw`;
    } else if (url.startsWith('http://pastie.org/p/')) {
        const pastieId = url.replace('http://pastie.org/p/', '');
        rawUrl = `http://pastie.org/p/${pastieId}/raw`;
    } else if (url.startsWith('https://pastefs.com/')) {
        const pastefsId = url.replace('https://pastefs.com/pid/', '');
        rawUrl = `https://pastefs.com/pid/${pastefsId}/raw`;
    }

    try {
        const response = await axios.get(rawUrl);
        res.json({ "result": response.data });
    } catch (error) {
        res.status(500).json({ "error": "Failed to fetch content", "details": error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
