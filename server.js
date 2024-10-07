const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the out directory
app.use(express.static(path.join(__dirname, 'out')));

// Serve index.html for all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log('Hand Capture Brobot v.1.0.0 (7.10.2024)');
    console.log(`Server is running at http://localhost:${PORT}`);
    exec(`start http://localhost:${PORT}`);
});