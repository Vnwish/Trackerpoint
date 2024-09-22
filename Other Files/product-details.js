const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");

// Set the path to the frontend build directory
const pagesPath = path.join(projectPath, "Pages");

// Serve the frontend build directory as static files
router.use(express.static(pagesPath));

// POST route for retrieving product details
router.post(".product-details.js", async (req, res) => {
  const { productUrl } = req.body;

  try {
    // Make a GET request to the provided product URL
    const response = await axios.get(productUrl);

    // Extract the relevant product details from the response
    const productDetails = response.data;

    // Render the product-details.ejs template and pass the product details as data
    res.render("product-details", { product: productDetails });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching product details:", error);
    res.status(500).send("An error occurred while fetching product details.");
  }
});

module.exports = router;
