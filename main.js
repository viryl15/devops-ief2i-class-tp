const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
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
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

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
        ip: req.ip || req.connection.remoteAddress,
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
const db = new sqlite3.Database('test.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS Books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL)');
        });
    }
});

// Get all books
app.get('/books', (req, res) => {
    db.all('SELECT * FROM Books', [], (err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            res.status(500).send(err.message);
        } else {
            res.json(rows);
        }
    });
});

// create book
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

    db.run(sql, params, function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.status(201).json({ id: this.lastID, title, author });
    });
});

// get single book
app.get('/books/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM books WHERE id = ?';
    const params = [id];

    db.get(sql, params, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (!row) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.status(200).json(row);
    });
});

// delete book
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM books WHERE id = ?';
    const params = [id];

    db.run(sql, params, function(err) {
        if (err) {
            return console.error(err.message);
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully' });
    });
});

const server = app.listen(4200, () => {
    console.log('Backend server running on port 4200');
});

module.exports = { server, app, db };
