const express = require('express');
const router = express.Router();
const { scrapeProductDetails } = require('./scraping');
const TrackedProduct = require('./models/trackedProduct');

// Endpoint to create an alert
router.post('/createAlert', async (req, res) => {
  try {
    const { url } = req.body; // Get the product URL from the request body

    // Check if the user is authenticated (user's email is available in the session)
    if (!req.session.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userEmail = req.session.user.email; // Retrieve the user's email from the session

    // Scrape product details based on the provided URL
    const productDetails = await scrapeProductDetails(url);

    if (!productDetails) {
      return res.status(400).json({ error: 'Failed to scrape product details' });
    }

    // Check if the product is already being tracked for the user
    const existingProduct = await TrackedProduct.findOne({ productUrl: url, userEmail });

    if (existingProduct) {
      return res.status(400).json({ error: 'Product is already being tracked for the user' });
    }

    // Create a new TrackedProduct document and save it in the database
    const newTrackedProduct = new TrackedProduct({
      productUrl: url,
      userEmail,
      brand: productDetails.brand,
      price: productDetails.price,
      image: productDetails.image,
      title: productDetails.title,
    });

    await newTrackedProduct.save();

    res.status(200).json({ message: 'Price tracking started for the product', data: newTrackedProduct });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Error occurred while creating the alert' });
  }
});

module.exports = router;
