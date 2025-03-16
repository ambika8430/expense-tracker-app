const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = 3001;

app.use(express.static(path.join(__dirname, 'public/pages')));

app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages', 'sign-in.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
