const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

async function scrapeAmazon(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    return {
      brand: 'Amazon',
      price: $('span.a-price-whole').first().text().trim(),
      image: $('#landingImage').attr('src'),
      title: $('#productTitle').text().trim(),
    };
  } catch (error) {
    console.log('Error scraping Amazon:', error.message);
    return null;
  }
}

async function scrapeFlipkart(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    return {
      brand: 'Flipkart',
      price: $('div._30jeq3._16Jk6d').text().trim().replace(/₹+/g, '₹'),
      image: $('div.CXW8mj._3nMexc img._396cs4._2amPTt._3qGmMb').attr('src'),
      title: $('span.B_NuCI').text().trim(),
    };
  } catch (error) {
    console.log('Error scraping Flipkart:', error.message);
    return null;
  }
}

app.get('/scrape', async (req, res) => {
    const amazonUrl = 'https://www.amazon.in/AVVATAR-WHEY-PROTEIN-Unflavoured-Fresh/dp/B09K3BXLBC/?_encoding=UTF8&pd_rd_w=1CjuO&content-id=amzn1.sym.183a023a-4f01-4b9f-b3a6-04594375027c&pf_rd_p=183a023a-4f01-4b9f-b3a6-04594375027c&pf_rd_r=G3YFT310RS38VTNCM2TW&pd_rd_wg=2LHld&pd_rd_r=357f23ef-7d41-4bfd-8c16-f52de23ed165&ref_=pd_gw_trq_ed_ig1rwdcn&th=1'; // Replace with Amazon product URL
    const flipkartUrl = 'https://www.flipkart.com/vivo-t1-44w-starry-sky-128-gb/p/itm2a08ebbea3689?pid=MOBGDRHVHNBBBBP5&lid=LSTMOBGDRHVHNBBBBP5HUNCJV&marketplace=FLIPKART&store=tyy%2F4io&srno=b_1_1&otracker=hp_omu_Top%2BOffers_2_4.dealCard.OMU_M4GNX82ESA8M_3&otracker1=hp_omu_PINNED_neo%2Fmerchandising_Top%2BOffers_NA_dealCard_cc_2_NA_view-all_3&fm=neo%2Fmerchandising&iid=2e9467ee-2391-4ded-90fe-2a4cd114b620.MOBGDRHVHNBBBBP5.SEARCH&ppt=hp&ppn=homepage&ssid=ebggw4270g0000001691874704871';  // Replace with Flipkart product URL

  try {
    const [amazonProduct, flipkartProduct] = await Promise.all([
      scrapeAmazon(amazonUrl),
      scrapeFlipkart(flipkartUrl),
    ]);

    const scrapedData = {
      amazon: amazonProduct,
      flipkart: flipkartProduct,
    };

    res.json(scrapedData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
