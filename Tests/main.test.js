const request = require('supertest');
const { server, app, db } = require('../main');

describe('/books endpoint', () => {
    beforeEach(() => {
        db.serialize(() => {
            db.run('DELETE FROM books');
        });
    });

    afterAll(() => {
        db.close();
        server.close();
    });

    it('should add a new book', async () => {
        const book = { title: 'The Catcher in the Rye', author: 'J.D. Salinger' };
        const res = await request(app).post('/books').send(book);
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({ ...book, id: expect.any(Number) });
    });

    it('should return a 400 error for missing title', async () => {
        const book = { author: 'J.D. Salinger' };
        const res = await request(app).post('/books').send(book);
        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({ error: 'Missing required property: title' });
    });

    it('should return a 400 error for missing author', async () => {
        const book = { title: 'The Catcher in the Rye' };
        const res = await request(app).post('/books').send(book);
        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({ error: 'Missing required property: author' });
    });

    it('should delete a book', async () => {
        const book = { title: 'The Catcher in the Rye', author: 'J.D. Salinger' };
        const postRes = await request(app).post('/books').send(book);
        const bookId = postRes.body.id;

        const deleteRes = await request(app).delete(`/books/${bookId}`);
        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body).toMatchObject({ message: 'Book deleted successfully' });
    });

    it('should return a 404 error for non-existent book', async () => {
        const deleteRes = await request(app).delete('/books/9999');
        expect(deleteRes.statusCode).toBe(404);
        expect(deleteRes.body).toMatchObject({ error: 'Book not found' });
    });

    it('should get a single book', async () => {
        const book = { title: 'The Catcher in the Rye', author: 'J.D. Salinger' };
        const postRes = await request(app).post('/books').send(book);
        const bookId = postRes.body.id;

        const getRes = await request(app).get(`/books/${bookId}`);
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body).toMatchObject({ ...book, id: bookId });
    });

    it('should return a 404 error for non-existent book', async () => {
        const getRes = await request(app).get('/books/9999');
        expect(getRes.statusCode).toBe(404);
        expect(getRes.body).toMatchObject({ error: 'Book not found' });
    });
});
