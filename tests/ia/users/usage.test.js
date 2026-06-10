require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');

describe('Users - Usage', () => {
    let accessToken;

    before(async () => {
        const login = await request(process.env.BASE_URL)
            .post('/auth/login')
            .send({
                email: process.env.EMAIL,
                password: process.env.PASSWORD
            });

        expect(login.status).to.equal(200);
        accessToken = login.body.accessToken;
    });

    it('CT01 - Deve retornar consumo do usuário autenticado', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me/usage')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');

        console.log(response.body);
    });

    it('CT02 - Não deve acessar usage sem token', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me/usage');

        expect(response.status).to.equal(401);
    });

    it('CT03 - Não deve acessar usage com token inválido', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me/usage')
            .set('Authorization', 'Bearer token_invalido');

        expect(response.status).to.equal(401);
    });
});