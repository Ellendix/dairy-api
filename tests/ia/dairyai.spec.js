require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');

describe('Users - Me - Token local', () => {
    it('CT01 - Deve retornar o usuário autenticado usando o TOKEN do .env', async () => {
        // Este arquivo funciona como smoke test para um token já provisionado no ambiente.
        expect(process.env.TOKEN).to.be.a('string').and.to.not.be.empty;

        const response = await request(process.env.BASE_URL)
            .get('/users/me')
            .set('Authorization', `Bearer ${process.env.TOKEN}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.be.an('object');
        expect(response.body.user).to.have.property('id');
        expect(response.body.user).to.have.property('email');
        expect(response.body.user).to.have.property('role');
    });
});
