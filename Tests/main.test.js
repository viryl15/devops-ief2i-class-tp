const request = require('supertest');
const express = require('express');

const app = express();

app.get('/books', (req, res) => {
    res.status(200).json({ books: ['book1', 'book2'] });
});

describe('GET /books', () => {
    it('should return a list of books', async () => {
        const response = await request(app).get('/books');
        expect(response.status).toBe(200);
        expect(response.body.books).toEqual(['book1', 'book2']);
    });
});
