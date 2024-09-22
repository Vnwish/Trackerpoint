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

// Function to handle form submission
function submitForm(event) {
  event.preventDefault();
  const form = document.getElementById("urlForm");
  const urlInput = document.getElementById("url");

  const url = urlInput.value.trim();

  scrapeProductDetails(url).then((data) => {
    console.log("Product Details:", data);
    // Display the scraped product details on the page as desired
  });

  // Reset the form after submission
  form.reset();
}

// Add event listener to the form submit event
const form = document.getElementById("urlForm");
form.addEventListener("submit", submitForm);
