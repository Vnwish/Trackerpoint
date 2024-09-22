const express = require("express");
const { scrapeProductDetails, checkAndUpdatePrices } = require("./scraping");
const { sendEmail } = require("./mail");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require('./models/user');
const UserAlert = require('./models/elert');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const crypto = require('crypto');
const projectPath = "C:\\Users\\hp\\Desktop\\Trackers point";
const pagesPath = path.join(projectPath, "Pages");
const imagesPath = path.join(projectPath, "Images");

// Serve static files from the pages directory
app.use(express.static(pagesPath));
app.use(express.static(imagesPath));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/trackerzpoint', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));




// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/signup'); // Redirect to the login page
}




// Session middleware and store configuration
app.use(
  session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: true,
    saveUninitialized: false,
    name: 'New-Session',
    cookie: { maxAge: 60 * 60 * 1000 }, // Session expires after 1 hour
    store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1:27017/trackerzpoint',
      collectionName: 'sessions',
    }),
  })
);

db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to the database"));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Define routes
app.get("/", (req, res) => {
  res.sendFile(path.join(pagesPath, "Index.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(pagesPath, "Register.html"));
});

app.post('/signup', async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword } = req.body;

    // Validate required fields
    if (!username || !email || !phone || !password || !confirmPassword) {
      return res.status(400).send(`
         <script>
            alert('All fields are required');
            window.location.href = '/signup';
         </script>
      `);
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).send(`
         <script>
            alert('Passwords do not match');
            window.location.href = '/signup';
         </script>
      `);
    }

    // Check if a user with the same username, email, or phone already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).send(`
         <script>
            alert('Username, email, or phone already exists');
            window.location.href = '/signup';
         </script>
      `);
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = new User({ username, email, phone, password: hashedPassword });
    await user.save();

    res.redirect('/signup');
  } catch (error) {
    console.error(error);
    res.status(500).send(`
        <script>
           alert('Error creating user');
           window.location.href = '/signup';
        </script>
     `);
  }
});




app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/signup',
  failureFlash: true
}), (req, res) => {
  // Set the user object in the session
  req.session.user = req.user;
  res.redirect('/home');
});


app.get('/loadAlerts', async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.session.user) {
      return res.status(401).send('User not authenticated');
    }

    // Retrieve the user data from the session
    const user = req.session.user;

    // Find the user alerts associated with the user's ID
    const userAlerts = await UserAlert.find({ userId: user._id });

    // Redirect to the target HTML page with user data and alerts as query parameters
    const redirectUrl = `/home?username=${user.username}&email=${user.email}&phone=${user.phone}&alerts=${encodeURIComponent(JSON.stringify(userAlerts))}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error loading user alerts:', error);
    res.status(500).send('Error loading user alerts');
  }
});




app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(pagesPath, "Password-Manager.html"));
});

// Add this route to handle password reset
app.post('/reset-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      res.status(400).send(`
         <script>
            alert('New passwords do not match');
            window.location.href = '/forgot-password';
         </script>
      `);
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send(`
         <script>
            alert('User not found');
            window.location.href = '/forgot-password';
         </script>
      `);
      return;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      res.status(400).send(`
         <script>
            alert('Invalid current password');
            window.location.href = '/forgot-password';
         </script>
      `);
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.redirect('/signup');
  } catch (error) {
    console.error(error);
    res.status(500).send(`
       <script>
          alert('Error resetting password');
          window.location.href = '/forgot-password';
       </script>
    `);
  }
});


app.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      res.status(400).send(`
         <script>
            alert('New passwords do not match');
            window.location.href = '/forgot-password';
         </script>
      `);
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send(`
         <script>
            alert('User not found');
            window.location.href = '/forgot-password';
         </script>
      `);
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.redirect('/signup');
  } catch (error) {
    console.error(error);
    res.status(500).send(`
       <script>
          alert('Error resetting password');
          window.location.href = '/forgot-password';
       </script>
    `);
  }
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        res.send('Error logging out');
      } else {
        res.redirect('/');
      }
    });
  });
});


app.get('/profile', isAuthenticated, (req, res) => {
  // Only authenticated users can access this route
  const user = req.user;
  const redirectUrl = `/profile.html?username=${user.username}&email=${user.email}&phone=${user.phone}&alerts=${encodeURIComponent(JSON.stringify(req.session.userAlerts))}`;
  res.redirect(redirectUrl);
});




// Rest of the code remains the same
// ...
app.get("/home", isAuthenticated, (req, res) => {
  res.sendFile(path.join(pagesPath, "Landing-Page.html"));
});


app.get('/home', async (req, res) => {
  try {
    const user = await User.findOne({ /* your authentication condition here */ });

    if (!user) {
      res.send('User not authenticated');
      return;
    }

    res.sendFile(path.join(pagesPath, "Landing-Page.html"));
  } catch (error) {
    res.send('Error retrieving profile');
  }
});




// Object to store tracked products
const trackedProducts = {};

// Endpoint to start tracking the price for a product
app.get('/startTracking', isAuthenticated, async (req, res) => {
  const { url } = req.query; // Get the product URL from the query parameters

  try {
    const userId = req.session.user._id;

    // Check if the product is already being tracked by the current user
    const existingAlert = await UserAlert.findOne({ userId, productUrl: url });

    if (existingAlert) {
      // If the product is already being tracked, update the email
      existingAlert.email = req.session.user.email;
      await existingAlert.save();
      console.log('Email updated for', url);
    } else {
      // If the product is not being tracked, create a new user alert document
      const userAlert = new UserAlert({
        userId,
        productUrl: url,
        // Set other alert fields as needed
        // ...
      });

      // Save the user alert to the database
      await userAlert.save();
      console.log('Started tracking the price for', url);
    }

    res.send('Price tracking started');
  }
  catch (error) {
    console.error('Error saving user alert:', error);
    res.status(500).send('Error saving user alert');
  }
});


// Endpoint to stop tracking the price for a product
app.get("/stopTracking", (req, res) => {
  const { url } = req.query; // Get the product URL from the query parameters

  if (trackedProducts[url]) {
    delete trackedProducts[url];
    console.log("Stopped tracking the price for", url);
    res.send("Price tracking stopped");
  } else {
    console.log("Product URL not found in tracking list:", url);
    res.status(400).send("Product URL not found in tracking list");
  }
});

// Endpoint to scrape product details
app.get("/scrape", async (req, res) => {
  const { url } = req.query; // Get the product URL from the query parameters

  const productDetails = await scrapeProductDetails(url);

  if (productDetails) {
    res.json(productDetails);
  } else {
    res.status(500).json({ error: "Failed to scrape product details" });
  }
});

// Start running the scraping periodically
checkAndUpdatePrices(trackedProducts);









app.get("/about", isAuthenticated, (req, res) => {
  res.sendFile(path.join(pagesPath, "About.html"));
});

app.get("/contact", isAuthenticated, (req, res) => {
  res.sendFile(path.join(pagesPath, "Contact.html"));
});

app.get("/privacy", isAuthenticated, (req, res) => {
  res.sendFile(path.join(pagesPath, "Privacy.html"));
});

app.get("/services", isAuthenticated, (req, res) => {
  res.sendFile(path.join(pagesPath, "Services.html"));
});

app.get("/confirm", isAuthenticated, (req, res) => {
  res.sendFile(path.join(pagesPath, "Confirm.html"));
});

app.get("/product-details", (req, res) => {
  res.sendFile(path.join(pagesPath, "Details.html"));
});

app.post("/contact", (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const msg = req.body.msg;

  const data = {
    "FirstName": firstname,
    "LastName": lastname,
    "Email": email,
    "Msg": msg
  };

  db.collection('contact').insertOne(data, (err, collection) => {
    if (err) {
      throw err;
    }
    console.log("Record Inserted Successfully");
  });

  return res.redirect('Confirm.html');
});

const port = 8000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

