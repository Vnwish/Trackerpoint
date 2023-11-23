const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const authenticate = require('../middleware/authenticate');
const User = require('../models/user');
const path = require('path');

router.post('/signup', async (req, res) => {
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
        console.log(user);
        console.log('User registered successfully');
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


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                req.session.user = user; // Store user object in session
                res.redirect('/home');
                console.log(user.email);
                console.log('User logged in successfully');
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


router.post('/forgot-password', async (req, res) => {
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


router.post('/reset-password', async (req, res) => {
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


// Add this route handler for the /profile endpoint
router.get('/profile', async (req, res) => {
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


router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        res.send('Error logging out');
      } else {
        res.redirect('/');
        console.log('User logged out');
      }
    });
  });


module.exports = router;