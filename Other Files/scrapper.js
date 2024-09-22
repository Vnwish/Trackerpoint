const puppeteer = require('puppeteer');

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

const itemUrl = 'https://www.amazon.in/NoiseFit-Bluetooth-Functional-Assistance-Tracker/dp/B0BMVT1R78/?_encoding=UTF8&pd_rd_w=SO6aS&content-id=amzn1.sym.aff93425-4e25-4d86-babd-0fa9faf7ca5d&pf_rd_p=aff93425-4e25-4d86-babd-0fa9faf7ca5d&pf_rd_r=R1CZS9454SRYAPZYJ8WV&pd_rd_wg=5ZheJ&pd_rd_r=955b0ffe-173d-47d1-ad4e-857a1072d836&ref_=pd_gw_ci_mcx_mr_hp_atf_m';
getCurrentPrice(itemUrl)
    .then((price) => {
        console.log('Current price:', price);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
