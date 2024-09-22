// app.js

const express = require('express');
const app = express();

// Define an API endpoint
app.get('/scraped-data', (req, res) => {
    // Your code to fetch the scraped data and store it in a variable, e.g., scrapedData
    // Ensure that scrapedData is an array or object containing the necessary information

    // Send the scraped data as a response

    const axios = require("axios");
    const cheerio = require("cheerio");

    // Function to scrape Amazon product details
    async function scrapeAmazon(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            // Extracting price
            let price = $("#priceblock_ourprice").text().trim();
            if (!price) {
                price = $("#priceblock_dealprice").text().trim();
            }
            if (!price) {
                price = $("#priceblock_saleprice").text().trim();
            }
            if (!price) {
                price = $(".a-price-whole").text().trim();
            }

            // Extracting image
            const image = $("#landingImage").attr("src");

            // Extracting title
            const title = $("#productTitle").text().trim();

            return {
                price,
                image,
                title,
            };
        } catch (error) {
            console.log("Error scraping Amazon:", error.message);
            return null;
        }
    }

    // Function to scrape Flipkart product details
    async function scrapeFlipkart(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            // Extracting price
            const price = $("._30jeq3._1_WHN1").text().trim();

            // Extracting image
            const image = $("._2_AcLJ").attr("src");

            // Extracting title
            const title = $("span.B_NuCI").text().trim();

            return {
                price,
                image,
                title,
            };
        } catch (error) {
            console.log("Error scraping Flipkart:", error.message);
            return null;
        }
    }

    // Function to scrape product details based on URL
    async function scrapeProductDetails(url) {
        if (url.includes("amazon")) {
            return scrapeAmazon(url);
        } else if (url.includes("flipkart")) {
            return scrapeFlipkart(url);
        } else {
            console.log("Unsupported website:", url);
            return null;
        }
    }

    // Example usage
    const productURL =
        "https://www.amazon.in/Noise-Launched-Bluetooth-Calling-Tracking/dp/B0BJ72WZQ7/ref=sr_1_1?pd_rd_r=52092fe2-72e8-4708-9a16-032e8be64dda&pd_rd_w=w03mu&pd_rd_wg=hW6IP&pf_rd_p=e2546a60-4148-477d-9317-c197edb0842a&pf_rd_r=MWH15BFGCV4PG37Q8S52&qid=1685051998&sr=8-1";

    scrapeProductDetails(productURL).then((data) => {
        console.log("Product Details:", data);
    });



    res.json(scrapedData);
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
