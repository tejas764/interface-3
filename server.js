require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const Registration = require('./models/Registration');

const app = express();
const PORT = process.env.PORT || 3000;

// ======= MongoDB Connection =======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ======= Ensure uploads folder exists =======
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ======= Middleware =======
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// ======= Multer Setup =======
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ======= Routes =======

// Home route (optional)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Registration Form
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
// Fetch all registrations (admin view)
app.get('/all', async (req, res) => {
  try {
    const allRegistrations = await Registration.find();
    res.json(allRegistrations);
  } catch (err) {
    console.error('❌ Error fetching registrations:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Handle registration
app.post('/register', upload.single('receipt'), async (req, res) => {
  try {
    const { name, email, contact, institution, state } = req.body;
    const events = req.body['events[]'];

    if (!name || !email || !contact || !institution || !state ) {
      return res.status(400).send('❌ All fields and receipt upload are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send('❌ Invalid email format.');
    }

    const registration = new Registration({
      name,
      email,
      contact,
      institution,
      state,
      events: Array.isArray(events) ? events : [events],
      receiptPath:'newpath',
    });

    await registration.save();
    res.send(`<h2>✅ Thank you ${name}! Your registration has been saved.</h2>`);
  } catch (err) {
    console.error('❌ Error during registration:', err);
    res.status(500).send('❌ Registration failed.');
  }
});

// ======= Start Server =======
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
