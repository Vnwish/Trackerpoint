const axios = require('axios');
const cheerio = require('cheerio');

class ScraperError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ScraperError';
  }
}

const USER_AGENTS = {
  chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  firefox:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0',
  safari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38',
  edge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134',
};

async function fetchHtml(url, userAgent) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
      },
    });
    return response.data;
  } catch (error) {
    throw new ScraperError(`Error fetching HTML from ${url}: ${error.message}`);
  }
}

async function scrapeWebsite(url, extractionFunction, userAgent) {
  try {
    const html = await fetchHtml(url, userAgent);
    return extractionFunction(html);
  } catch (error) {
    console.log(error instanceof ScraperError ? 'Custom Error:' : 'General Error:', error.message);
    return null;
  }
}

// Introduce a delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const amazonUrl = 'https://www.amazon.in/AVVATAR-WHEY-PROTEIN-Unflavoured-Fresh/dp/B09K3BXLBC/?_encoding=UTF8&pd_rd_w=1CjuO&content-id=amzn1.sym.183a023a-4f01-4b9f-b3a6-04594375027c&pf_rd_p=183a023a-4f01-4b9f-b3a6-04594375027c&pf_rd_r=G3YFT310RS38VTNCM2TW&pd_rd_wg=2LHld&pd_rd_r=357f23ef-7d41-4bfd-8c16-f52de23ed165&ref_=pd_gw_trq_ed_ig1rwdcn&th=1'; // Replace with Amazon product URL
  const flipkartUrl = 'https://www.flipkart.com/bevzilla-south-blend-dark-roast-instant-coffee/p/itmb12cd88e72f4d?pid=CFEGZ79EWGUCRJWG&lid=LSTCFEGZ79EWGUCRJWGGBCV7U&marketplace=FLIPKART&store=eat%2Fdui&srno=b_1_1&otracker=hp_omu_Sports%252C%2BHealthcare%2B%2526%2Bmore_1_14.dealCard.OMU_MM3Y649F8F2K_8&otracker1=hp_omu_PINNED_neo%2Fmerchandising_Sports%252C%2BHealthcare%2B%2526%2Bmore_NA_dealCard_cc_1_NA_view-all_8&fm=neo%2Fmerchandising&iid=en_nvUN_TgjBCRAlA40cH9TeysckXu65F3xv0_OnguoeSFa9XaR4Qj3Aiu1Whga71dJsAEHFb99IuHxTfn88XlQeQ%3D%3D&ppt=hp&ppn=homepage&ssid=re26i2hkv40000001687879654478'; // Replace with Flipkart product URL

  try {
    const [amazonProduct, flipkartProduct] = await Promise.all([
      scrapeWebsite(amazonUrl, extractDataFromAmazon, USER_AGENTS.chrome),
      scrapeWebsite(flipkartUrl, extractDataFromFlipkart, USER_AGENTS.chrome),
    ]);

    const scrapedData = {
      amazon: amazonProduct,
      flipkart: flipkartProduct,
    };

    console.log('Scraped Data:', scrapedData);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function extractDataFromAmazon(html) {
  const $ = cheerio.load(html);

  return {
    brand: 'Amazon',
    price: $('span.a-price-whole').first().text().trim(),
    image: $('#landingImage').attr('src'),
    title: $('#productTitle').text().trim(),
  };
}

async function extractDataFromFlipkart(html) {
  const $ = cheerio.load(html);

  return {
    brand: 'Flipkart',
    price: $('div._30jeq3._16Jk6d').text().trim().replace(/₹+/g, '₹'),
    image: $('div.CXW8mj._3nMexc img._396cs4._2amPTt._3qGmMb').attr('src'),
    title: $('span.B_NuCI').text().trim(),
  };
}

main();

