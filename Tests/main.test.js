const request = require('supertest');
const {server, app, dbs} = require('../main');





describe('/books endpoint', () => {
    beforeEach(() => {
      dbs.serialize(() => {
        dbs.run('DELETE FROM books');
      });
    });

    afterAll(() => {
        dbs.close();
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
  });




// describe('GET /books', () => {
//     it('should return a list of books', async () => {
//         const response = await request(app).get('/books');
//         expect(response.status).toBe(200);
//         expect(response.body[0]).toEqual(
//             {
//                 'id': 1,
//                 'title': 'Things Fall Apart',
//                 'author': 'Chinua Achebe'
//             });
//     });
// });
