require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');

describe('Users - Plan', () => {
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

    it('CT01 - Deve retornar plano do usuário autenticado', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me/plan')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');

        console.log(response.body);
    });

    it('CT02 - Não deve acessar plano sem token', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me/plan');

        expect(response.status).to.equal(401);
    });

    it('CT03 - Não deve acessar plano com token inválido', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me/plan')
            .set('Authorization', 'Bearer token_invalido');

        expect(response.status).to.equal(401);
    });
});