require('dotenv').config();
// import 'dotenv/config';
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');


const app = express();

app.use(cors());
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
    // host: "127.0.0.1",
    // port: "3306",
    // user: "root",
    // password: "Argent2022",
    // database: "bd_book"
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.get('/books', (req, res) => {
    db.query('SELECT * FROM Books', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});


const africanBooks = [
    { title: 'Things Fall Apart', author: 'Chinua Achebe' },
    { title: 'Death and the King\'s Horseman', author: 'Wole Soyinka' },
    { title: 'July\'s People', author: 'Nadine Gordimer' },
    { title: 'Petals of Blood', author: 'Ngugi wa Thiong’o' },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie' }
];

app.get('/loadData', (req, res) => {
    const queries = africanBooks.map(book => {
        const { title, author } = book;
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO Books (title, author) VALUES (?, ?)';
            db.query(query, [title, author], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    });

    // Exécuter toutes les requêtes d'insertion
    Promise.all(queries)
        .then(() => {
            res.send('Data loaded successfully!');
        })
        .catch(err => {
            console.error('Error loading data:', err);
            res.status(500).send(err);
        });
});

app.listen(4200, () => {
    console.log('Backend server running on port 4200');
});
