const request = require("request");
const cheerio = require("cheerio");

// Enter the URL of the product you want to scrape
const url = "https://www.amazon.in/CrossBeats-Launched-Fashion-Bluetooth-Smartwatch/dp/B0BWHQHMM2/?_encoding=UTF8&pd_rd_w=4caTK&content-id=amzn1.sym.aff93425-4e25-4d86-babd-0fa9faf7ca5d&pf_rd_p=aff93425-4e25-4d86-babd-0fa9faf7ca5d&pf_rd_r=QZ734QC9MDQFEEZ7HXAA&pd_rd_wg=q5vGA&pd_rd_r=ca6b7849-6d60-43bb-a861-556c0156a26f&ref_=pd_gw_ci_mcx_mr_hp_atf_m";

// Make a request to the website
request(url, function (error, response, body) {
  if (error) {
    console.log(error);
    return;
  }

  // Parse the HTML response
  const $ = cheerio.load(body);

  // Find the product price
  const productPrice = $(".a-price").text();

  // Create an HTML page to display the price
  const html = `
    <html>
      <head>
        <title>Product Price</title>
      </head>
      <body>
        <h1>Product Price</h1>
        <p>${productPrice}</p>
      </body>
    </html>
  `;

  // Write the HTML page to the console
  console.log(html);

  // Save the HTML page to a file
  // ...
});