const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const crypto = require('crypto');  

const app = express();

// Middleware
const middleware = require('./middleware/authenticate');

// Serve static files from the "Pages" and "Images" directories
const pagesPath = path.join(__dirname, '..', 'frontend', 'Pages');
const imagesPath = path.join(__dirname, '..', 'frontend', 'public', 'images');
const cssPath = path.join(__dirname, '..', 'frontend', 'public', 'css');
const jsPath = path.join(__dirname, '..', 'frontend', 'public', 'js');
app.use(express.static(jsPath));
app.use(express.static(cssPath)); 
app.use(express.static(pagesPath));
app.use(express.static(imagesPath));

// Parse request body
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware and store
app.use(
  session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: true,
    saveUninitialized: false,     
    name: 'New-Session', 
    cookie: { maxAge: 60 * 60 * 1000 }, // Session expires after 1 hour
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://vishalnagar74405:Mp41vishaldhakad@cluster0.pbtfahk.mongodb.net/Trackerz-Point',
      collectionName: 'sessions',
      ttl: 60 * 60, // Session TTL set to 1 hour (in seconds) 
    }), 
  })
  
);

// Routes
const routes = require('./routes');
const { eachOf } = require('async');
const { parentPort } = require('worker_threads');
app.use('/', routes);


const port = 2000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});



 