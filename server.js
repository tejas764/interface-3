require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer'); // ✅ Add this
const Registration = require('./models/Registration');

const app = express();
const PORT = process.env.PORT || 3000;

// ======= 1. MongoDB Connection =======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ======= 2. Middleware =======
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ======= 3. Multer Setup for File Upload =======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ======= 4. Routes =======

// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registration Form
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Handle Form Submission (with file)
app.post('/register', upload.single('receipt'), async (req, res) => {
  try {
    const { name, email, contact, institution, state } = req.body;
    const events = req.body['events[]'];

    if (!name || !email || !contact || !institution || !state) {
      return res.status(400).send('❌ All fields are required.');
    }

    console.log('📦 Received:', req.body);
    console.log('🖼️ Receipt file:', req.file);

    const registration = new Registration({
      name,
      email,
      contact,
      institution,
      state,
      events: Array.isArray(events) ? events : [events],
      receiptPath: req.file.path, // you can save file path if needed
    });

    await registration.save();

    res.send(`<h2>✅ Thank you ${name}! Your registration has been saved in MongoDB Atlas.</h2>`);
  } catch (err) {
    console.error('❌ Error during registration:', err);
    res.status(500).send('❌ Registration failed.');
  }
});

// ======= 5. Start Server =======
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
