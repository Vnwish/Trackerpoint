const axios = require("axios");
const cheerio = require("cheerio");
const { sendEmail } = require("./mail");

// Object to store tracked products
const trackedProducts = {};

// Function to scrape Amazon product details
async function scrapeAmazon(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extracting brand name
    const brand = $("#bylineInfo").text().trim();

    // Extracting price
    const price = $("span.a-price-whole").first().text().trim();

    // Extracting image
    const image = $("#landingImage").attr("src");

    // Extracting title
    const title = $("#productTitle").text().trim();

    return {
      brand: "Amazon",
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

    // Extracting brand name
    const brand = $("div._1AtVbE").text().trim();

    // Extracting price
    let price = $("div._30jeq3._16Jk6d").text().trim();
    price = price.replace(/₹+/g, "₹"); // Remove duplicate rupee symbol

    // Extracting image
    const image = $("div.CXW8mj._3nMexc img._396cs4._2amPTt._3qGmMb").attr("src");

    // Extracting title
    const title = $("span.B_NuCI").text().trim();

    return {
      brand: "Flipkart",
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
  if (url.includes("127")) {
    return scrapeAmazon(url);
  } else if (url.includes("flipkart")) {
    return scrapeFlipkart(url);
  } else {
    console.log("Unsupported website:", url);
    return null;
  }
}

// Function to check and update the price for tracked products
async function checkAndUpdatePrices() {
  const trackedProductUrls = Object.keys(trackedProducts); // Define the variable here

  if (trackedProductUrls.length > 0) {
    console.log("Tracking", trackedProductUrls.length, "product(s):");

    for (const url of trackedProductUrls) {
      const productDetails = await scrapeProductDetails(url);

      if (productDetails) {
        console.log("Product:", productDetails.title);
        console.log("Latest price:", productDetails.price);

        // Compare the latest price with the previous one
        if (trackedProducts[url].price && productDetails.price < trackedProducts[url].price) {
          const recipient = trackedProducts[url].email;
          const subject = 'Price Drop Notification';
          const body = `The price has dropped for ${url}! New price: ${productDetails.price}`;

          // Use the sendEmail function from your mail script to send the email notification
          sendEmail(recipient, subject, body);
        }

        // Update the price for the tracked product
        trackedProducts[url].price = productDetails.price;
      }
    }
  }

  setTimeout(checkAndUpdatePrices, 5000); // Run every 5 seconds (5000 milliseconds)
}

module.exports = {
  scrapeProductDetails,
  trackedProducts,
  checkAndUpdatePrices,
};