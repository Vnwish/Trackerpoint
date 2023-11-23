const mongoose = require('mongoose');

const dbUrl = 'mongodb+srv://vishalnagar74405:Mp41vishaldhakad@cluster0.pbtfahk.mongodb.net/Trackerz-Point'; // Replace with your actual MongoDB connection string

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});

module.exports = db;