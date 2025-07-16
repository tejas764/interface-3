// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route: Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route: code.html
app.get('/code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'code.html'));
});

// Placeholder for future form/email route
app.post('/register', (req, res) => {
  // You can add email logic here later
  res.send('Form received (email logic pending)');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
