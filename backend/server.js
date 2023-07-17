const express = require("express");
const { scrapeProductDetails, trackedProducts, checkAndUpdatePrices } = require("./scraping");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const crypto = require('crypto');


const projectPath = "C:\\Users\\HP\\Downloads\\TrackerzPoint";
const pagesPath = path.join(projectPath, "client");
const imagesPath = path.join(projectPath, "Images");

// Serve static files from the pages directory
app.use(express.static(pagesPath));
app.use(express.static(imagesPath));
app.use(express.urlencoded({ extended: true }));


//Database:-
mongoose.connect('mongodb://127.0.0.1:27017/trackerzPointUserDetails', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}); 

const db = mongoose.connection;

db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to the database"));


// Session middleware and store configuration
app.use(
   session({
     secret: "New Session",
     resave: true,
     saveUninitialized: false,
     cookie: { maxAge: 60 * 60 * 1000 }, // Session expires after 1 hour
     store: MongoStore.create({
       mongoUrl: 'mongodb://127.0.0.1:27017/trackerzPointUserDetails',
       collectionName: 'sessions',
     }),
   })
 );


 app.get('/logout', (req, res) => {
   req.session.destroy((err) => {
     if (err) {
       console.log(err);
       res.send('Error logging out');
     } else {
       res.redirect('/');
     }
   });
 });


// Session middleware and store configuration
app.use(
  session({
    secret:crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1:27017/trackerzPointUserDetails',
      collectionName: 'sessions',
    }),
  })
);


// Define routes
app.get("/", (req, res) => {
  res.sendFile(path.join(pagesPath, "index.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(pagesPath, "registration.html"));
});

app.post('/signup', async (req, res) => {
   try {
      const { username, email, phone, password, confirmPassword } = req.body;

      // Validate required fields
      if (!username || !email || !phone || !password || !confirmPassword) {
         return res.status(400).send(`
            <script>
               alert('All fields are required');
               window.location.href = '/registration.html';
            </script>
         `);
      }

      // Check if passwords match
      if (password !== confirmPassword) {
         return res.status(400).send(`
            <script>
               alert('Passwords do not match');
               window.location.href = '/registration.html';
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
               window.location.href = '/registration.html';
            </script>
         `);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const user = new User({ username, email, phone, password: hashedPassword });
      await user.save();

      res.redirect('/login');
   } catch (error) {
      console.error(error);
      res.status(500).send(`
         <script>
            alert('Error creating user');
            window.location.href = '/registration.html';
         </script>
      `);
   }
});



app.get("/login", (req, res) => {
  res.sendFile(path.join(pagesPath, "login.html"));
});


app.post('/login', async (req, res) => {
  try {
     const { email, password } = req.body;
     const user = await User.findOne({ email });

     if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
           req.session.user = user; // Store user object in session
           res.redirect('/home');
           return;
        }
     }

     res.status(400).send(`
        <script>
           alert('Invalid email or password');
           window.location.href = '/login.html';
        </script>
     `);
  } catch (error) {
     console.error(error);
     res.status(500).send(`
        <script>
           alert('Error logging in');
           window.location.href = '/login.html';
        </script>
     `);
  }
});



app.get("/home", (req, res) => {
  res.sendFile(path.join(pagesPath, "landingpage.html"));
});


app.get('/home', async (req, res) => {
    try {
        const user = await User.findOne({ /* your authentication condition here */ });

        if (!user) {
            res.send('User not authenticated');
            return;
        }

        res.sendFile(path.join(pagesPath, "landingpage.html"));
    } catch (error) {
        res.send('Error retrieving profile');
    }
});


app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(pagesPath, "forgot-password.html"));
});


app.post('/forgot-password', async (req, res) => {
  try {
     const { email, newPassword, confirmNewPassword } = req.body;

     if (newPassword !== confirmNewPassword) {
        res.status(400).send(`
           <script>
              alert('New passwords do not match');
              window.location.href = '/forgot-password.html';
           </script>
        `);
        return;
     }

     const user = await User.findOne({ email });

     if (!user) {
        res.status(400).send(`
           <script>
              alert('User not found');
              window.location.href = '/forgot-password.html';
           </script>
        `);
        return;
     }

     const hashedPassword = await bcrypt.hash(newPassword, 10);
     user.password = hashedPassword;
     await user.save();

     res.redirect('/login');
  } catch (error) {
     console.error(error);
     res.status(500).send(`
        <script>
           alert('Error resetting password');
           window.location.href = '/forgot-password.html';
        </script>
     `);
  }
});

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(pagesPath, "reset-password.html"));
});


app.post('/reset-password', async (req, res) => {
  try {
     const { email, currentPassword, newPassword, confirmNewPassword } = req.body;

     if (newPassword !== confirmNewPassword) {
        res.status(400).send(`
           <script>
              alert('New passwords do not match');
              window.location.href = '/reset-password.html';
           </script>
        `);
        return;
     }

     const user = await User.findOne({ email });

     if (!user) {
        res.status(400).send(`
           <script>
              alert('User not found');
              window.location.href = '/reset-password.html';
           </script>
        `);
        return;
     }

     const passwordMatch = await bcrypt.compare(currentPassword, user.password);
     if (!passwordMatch) {
        res.status(400).send(`
           <script>
              alert('Invalid current password');
              window.location.href = '/reset-password.html';
           </script>
        `);
        return;
     }

     const hashedPassword = await bcrypt.hash(newPassword, 10);
     user.password = hashedPassword;
     await user.save();

     res.redirect('/login');
  } catch (error) {
     console.error(error);
     res.status(500).send(`
        <script>
           alert('Error resetting password');
           window.location.href = '/reset-password.html';
        </script>
     `);
  }
});


   

// Endpoint to start tracking the price for a product
app.get("/startTracking", (req, res) => {
   
   const { url, email } = req.query; // Get the product URL and email from the query parameters
 
   if (!trackedProducts[url]) {
     trackedProducts[url] = { email, price: null };
     console.log("Started tracking the price for", url);
   } else {
     trackedProducts[url].email = email;      
     console.log("Email updated for", url);
   }
 
   res.send("Price tracking started");
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
 checkAndUpdatePrices();


app.get("/about", (req, res) => {
  res.sendFile(path.join(pagesPath, "About.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(pagesPath, "Contact.html"));
});

app.get("/service", (req, res) => {
  res.sendFile(path.join(pagesPath, "Service.html"));
});


app.post("/contactDetails", (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const mobileno = req.body.mobileno;
  const email = req.body.email;
  const msg = req.body.msg;

  const data = {
    "FirstName": firstname,
    "LastName": lastname,
    "mobileno": mobileno,
    "Email": email,
    "Msg": msg
  };

  db.collection('contactDetails').insertOne(data, (err, collection) => {
    if (err) {
      throw err;
    }
    console.log("contact Record Inserted Successfully");
  });

  return res.redirect('contactDetails.html');
});


// app.get("/profile", (req, res) => {
//    res.sendFile(path.join(pagesPath, "profile.html"));
//  });



// Add this route handler for the /profile endpoint
app.get('/profile', async (req, res) => {
   try {
     // Check if the user is authenticated
     if (!req.session.user) {
       return res.status(401).send('User not authenticated');
     }
 
     // Retrieve the user data from the session
     const user = req.session.user;
 
     // Redirect to the target HTML page with user data as query parameters
     const redirectUrl = `/profile.html?username=${user.username}&email=${user.email}&phone=${user.phone}`;
     res.redirect(redirectUrl);
   } catch (error) {
     console.error(error);
     res.status(500).send('Error retrieving profile');
   }
 });
 
 

 



//server routes:
const port = 2000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
