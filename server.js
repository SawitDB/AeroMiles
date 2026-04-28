const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Simulasi Database & Session
let currentUser = null; 
let users = []; // Data pendaftar sementara

// 1. Navbar & Root Route
app.get('/', (req, res) => {
    if (currentUser) return res.redirect('/dashboard');
    res.redirect('/login');
});

// 2. Fitur Login & Logout
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username } = req.body;
    // Mock login sederhana
    currentUser = { name: "Sean Marcello", npm: "2406401792", miles: 5000 };
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    currentUser = null;
    res.redirect('/login');
});

// 3. Fitur Registrasi (Create & Read)
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { name, npm } = req.body;
    users.push({ name, npm });
    res.redirect('/login');
});

// 4. Fitur Dashboard (Read)
app.get('/dashboard', (req, res) => {
    if (!currentUser) return res.redirect('/login');
    res.render('dashboard', { user: currentUser });
});

// 5. Fitur Pengaturan Profil (Read & Update)
app.get('/profile', (req, res) => {
    if (!currentUser) return res.redirect('/login');
    res.render('profile', { user: currentUser });
});

app.post('/profile', (req, res) => {
    if (currentUser) {
        currentUser.name = req.body.name; // Update nama
    }
    res.redirect('/profile');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`AeroMiles berjalan di http://localhost:${PORT}`));