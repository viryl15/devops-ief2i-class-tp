const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());


// Initialize SQLite database
const dbs = new sqlite3.Database('test.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        dbs.serialize(() => {
            dbs.run('CREATE TABLE IF NOT EXISTS Books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL)');
        });
    }
});

// Get all books
app.get('/books', (req, res) => {
    dbs.all('SELECT * FROM Books', [], (err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

// Load initial data into the database
const africanBooks = [
    { title: 'Things Fall Apart', author: 'Chinua Achebe' },
    { title: 'Death and the King\'s Horseman', author: 'Wole Soyinka' },
    { title: 'July\'s People', author: 'Nadine Gordimer' },
    { title: 'Petals of Blood', author: 'Ngugi wa Thiong’o' },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie' }
];

app.get('/loadData', async (req, res) => {
    const queries = africanBooks.map(book => {
        const { title, author } = book;
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO Books (title, author) VALUES (?, ?)';
            dbs.run(query, [title, author], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    });

    try {
        await Promise.all(queries);
        res.send('Data loaded successfully!');
    } catch (err) {
        console.error('Error loading data:', err.message);
        res.status(500).send(err.message);
    }
});

let server = app.listen(4200, () => {
    console.log('Backend server running on port 4200');
});



module.exports = {server, app};
