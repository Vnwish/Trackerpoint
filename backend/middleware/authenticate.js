const bcrypt = require('bcrypt');

module.exports = async function (req, res, next) {
  try {
    // Check if the user is authenticated
    if (!req.session.user) {
      return res.status(401).send('User not authenticated');
    }
    
    const user = await User.findOne({ email: req.session.user.email });
    
    if (!user) {
      res.status(401).send('User not authenticated');
      return;
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving user data');
  }
};