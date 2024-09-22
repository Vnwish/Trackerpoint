const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cache = require('memory-cache');

const app = express();

app.get('/', async (req, res) => {
  const searchTerm = req.query.searchTerm;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Missing search term' });
  }

  const product = await getProduct(searchTerm);

  res.json(product);
});

async function getProduct(searchTerm) {
  const cacheKey = `amazon-product-${searchTerm}`;

  if (cache.get(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const url = `https://www.amazon.in/gp/aw/d/B09G99CW2N/?_encoding=UTF8&pd_rd_plhdr=t&aaxitk=c5ff115c1ba1d9f7edec86bc8c6a4f99&hsa_cr_id=9638012290402&qid=1691949750&sr=1-1-e0fa1fdd-d857-4087-adda-5bd576b25987&ref_=sbx_be_s_sparkle_mcd_asin_0_img&pd_rd_w=ukKaL&content-id=amzn1.sym.df9fe057-524b-4172-ac34-9a1b3c4e647d%3Aamzn1.sym.df9fe057-524b-4172-ac34-9a1b3c4e647d&pf_rd_p=df9fe057-524b-4172-ac34-9a1b3c4e647d&pf_rd_r=RY5V3X0NEQ9A6ETM8D3V&pd_rd_wg=APLmj&pd_rd_r=dc2cb322-cad6-4f4c-acb3-89ca976d532d`;
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const product = {
      title: $('#productTitle').text().trim(),
      price: $('span.a-price-whole').first().text().trim(),
      image: $('#landingImage').attr('src'),
    };

    cache.put(cacheKey, product, 60000); // Cache for 60 seconds (adjust as needed)

    return product;
  } catch (error) {
    throw new Error('Error fetching product details: ' + error.message);
  }
}

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
