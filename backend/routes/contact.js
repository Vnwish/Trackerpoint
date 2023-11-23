const express = require('express');
const router = express.Router();
const db = require('../db');

router.post("/contactDetails", (req, res) => {
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
    console.log(data);
    console.log("contact Record Inserted Successfully");
  });

  return res.redirect('contactDetails.html');
});

module.exports = router;