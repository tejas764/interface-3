require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
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

// ======= Multer Setup with Cloudinary =======
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'interface_receipts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});
const upload = multer({ storage });

// ======= Middleware =======
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ======= Routes =======

// Home route
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

    if (!name || !email || !contact || !institution || !state || !req.file) {
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
      receipt: {
        url: req.file.path,
        public_id: req.file.filename
      }
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
