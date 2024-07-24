const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser')
const express = require('express');
const cors = require('cors');
const uuid = require('uuid');

require('dotenv').config();

const app = express();


const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'app.log');

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use((req, res, next) => {
    const requestId = uuid.v4();
    const startTime = new Date();
    const logData = {
        requestId: requestId,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'],
        timestamp: new Date().toISOString(),
    };

    res.on('finish', () => {
        const duration = new Date() - startTime;
        logData.duration = duration;
        const statusCode = res.statusCode;
        logData.statusCode = statusCode;

        fs.appendFile(logFilePath, JSON.stringify(logData) + '\n', (err) => {
        if (err) {
            console.error(`Error writing to log file: ${err}`);
        }
        });
    });

    next();
});



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

app.post('/books', (req, res) => {
    const { title, author } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Missing required property: title' });
      }
    
      if (!author) {
        return res.status(400).json({ error: 'Missing required property: author' });
      }
  
    const sql = 'INSERT INTO books (title, author) VALUES (?, ?)';
    const params = [title, author];
  
    dbs.run(sql, params, function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.status(201).json({ id: this.lastID, title, author });
    });
  });


let server = app.listen(4200, () => {
    console.log('Backend server running on port 4200');
});



module.exports = {server, app, dbs};
