require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const Registration = require('./models/Registration');
const nodemailer = require('nodemailer');
const auth = require('basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ======= MongoDB Connection =======
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ======= Multer + Cloudinary Storage =======
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

// ======= Basic Auth Middleware =======
const adminAuth = (req, res, next) => {
  const user = auth(req);
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || '0000';

  if (user && user.name === username && user.pass === password) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).send('<h3>🛑 Unauthorized Access</h3><p>You need to enter valid credentials.</p>');
};

// ======= Routes =======

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registration Form
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Admin Panel (Protected)
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin Data (Protected)
app.get('/all', adminAuth, async (req, res) => {
  try {
    const allRegistrations = await Registration.find();
    res.json(allRegistrations);
  } catch (err) {
    console.error('❌ Error fetching registrations:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/preRegister',(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'preRegister.html'));
});
// =======| Registration Route |=======
app.post('/register', upload.single('receipt'), async (req, res) => {
  try {
    const { name, email, contact, institution, state } = req.body;
    const events = req.body.events;
    const selectedEvents = Array.isArray(events) ? events : events ? [events] : [];

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
      events: selectedEvents,
      receipt: {
        url: req.file.path,
        public_id: req.file.filename
      }
    });

    await registration.save();

    // =======-- Send Email =======--
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    

    const mailOptions = {
      from: `"Interface Fest Team 👾" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Fest Registration Confirmation",
      html: `
        <h2>Greetings,${name}!</h2>
<p>🎉 Your quest begins! Thank you for registering for <b>INTERFACE 2025<b>!</p>
<p>We're thrilled to have you join us for a year where <i>technology meets entertainment<i>. Get ready to level up your skills!</p>
<br/>
<h3>Your Registration Details:</h3>
<ul>
  <li><strong>Institution:</strong> ${institution}</li>
  <li><strong>State:</strong> ${state}</li>
  <li><strong>Selected Events:</strong> ${selectedEvents.join(', ')}</li>
</ul>
<br/>
<p>We've successfully received your payment receipt and confirmed your registration. Consider this your <b>"Loading Complete"<b> screen!</p>
<p>Your <strong>WhatsApp group link<strong> will be sent to your registered email </strong>once your details have been verified by our team**. Please allow up to 24 hours for this process.</p>
<p>You'll receive a detailed email with the <b>official schedule, event rules, and any specific instructions<b> for your chosen battles (events) very soon.</p>
<p>In the meantime, mark your calendars for <b>August 23, 2025<b>!</p>
<p>Keep up with all the action and sneak peeks on our Instagram: <a href="https://www.instagram.com/interface.2025" style="color: #00ffff; text-decoration: none;" target="_blank">@interface.2025</a>**</p>
<p>If you have any <strong>side quests or queries</strong>, our student coordinators are ready to assist. Visit our official website's <a href="www.christuniversity.in" style="color: #00ffff; text-decoration: none;"><b>Contact Us<b></a> section for details, or reply directly to this email.</p>
<br/>
<p>Prepare for an epic experience!</p>
<p>Best Regards,<br/>
 Organizing Committee<br/>
👾 [interface.christuniversity.in] 👾</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${email}`);

    res.redirect('/?registered=success');

  } catch (err) {
    console.error('❌ Error during registration:', err);
    res.status(500).send('❌ Registration failed.');
  }
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contactUs.html'));
});

app.post('/contact', async (req, res) => {
  const { useremail, query, message } = req.body;

  //----------------------- Validate fields---------------------------
  if (!useremail) {
    return res.status(400).send('<h3>❌ Message must be at least 15 characters.</h3><a href="/contact">Go Back</a>');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: useremail,
      to: process.env.EMAIL_USER, // admin receives the message
      subject: `New Query: ${query}`,
      html: `
        <h3>You've received a new message from Interface Contact Form</h3>
        <p><strong>From:</strong> ${useremail}</p>
        <p><strong>Subject:</strong> ${query}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.send('<h3>✅ Your message was sent successfully!</h3><a href="/">Back to Home</a>');
  } catch (err) {
    console.error('❌ Email Error:', err);
    res.status(500).send('<h3>❌ Failed to send message. Try again later.</h3><a href="/contact">Go Back</a>');
  }
});

// ======= Start Server =======
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
