const request = require('supertest');
const {server, app} = require('../main');


afterAll(() => {
    server.close()
})

describe('GET /books', () => {
    it('should return a list of books', async () => {
        const response = await request(app).get('/books');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                'id': 1,
                'title': 'Things Fall Apart',
                'author': 'Chinua Achebe'
            },
            {
                'id': 2,
                'title': 'Half of a Yellow Sun',
                'author': 'Chimamanda Ngozi Adichie'
            },
            {
                'id': 3,
                'title': 'July\'s People',
                'author': 'Nadine Gordimer'
            },
            {
                'id': 4,
                'title': 'Petals of Blood',
                'author': 'Ngugi wa Thiong’o'
            },
            {
                'id': 5,
                'title': 'Death and the King\'s Horseman',
                'author': 'Wole Soyinka'
            }
        ]);
    });
});
