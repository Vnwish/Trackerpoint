const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.get('/getPrice', async (req, res) => {
    const { url } = req.query;

    try {
        const price = await getCurrentPrice(url);
        res.json({ price });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

async function getCurrentPrice(itemUrl) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (
            req.resourceType() === 'image' ||
            req.resourceType() === 'stylesheet' ||
            req.resourceType() === 'font'
        ) {
            req.abort();
        } else {
            req.continue();
        }
    });

    page.setDefaultNavigationTimeout(0);

    await page.goto(itemUrl, { waitUntil: 'domcontentloaded' })
        .catch((error) => console.error('Error at page.goto: ', error));

    let curPrice = await page.evaluate(() => {
        return document.querySelector('.a-offscreen')?.innerHTML;
    });

    browser.close();

    if (curPrice) curPrice = curPrice.replace(/\,/g, '');

    return curPrice;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
