const express = require('express');
const app = express();
const path = require('path');

// Setup EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware untuk file statis dan form parsing
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Route Utama (Dashboard AeroMiles)
app.get('/', (req, res) => {
    // Contoh data yang nantinya diambil dari database (SQL)
    const userData = {
        name: "Sean Marcello",
        npm: "2406401792", // NPM Genap
        milesBalance: 5000,
        transactions: [
            { date: '2026-04-01', activity: 'Flight Jakarta-Bali', points: +500 },
            { date: '2026-04-10', activity: 'Redeem Lounge access', points: -200 }
        ]
    };
    res.render('index', { user: userData });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`AeroMiles running at http://localhost:${PORT}`);
});