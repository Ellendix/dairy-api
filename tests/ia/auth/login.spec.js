require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');

describe('Auth - Login', () => {
    it('CT01 - Deve realizar login com sucesso', async () => {
        const response = await request(process.env.BASE_URL)
            .post('/auth/login')
            .send({
                email: process.env.EMAIL,
                password: process.env.PASSWORD
            });

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('accessToken');
        expect(response.body).to.have.property('refreshToken');
        expect(response.body).to.have.property('sessionId');
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.have.property('email');
    });
    it('CT02 - Não deve logar com senha incorreta', async () => {
        const response = await request(process.env.BASE_URL)
            .post('/auth/login')
            .send({
                email: process.env.EMAIL,
                password: 'senha_incorreta_123'
            });

        expect(response.status).to.not.equal(200);
        expect(response.body).to.not.have.property('accessToken');
    });

    it('CT03 - Não deve logar com e-mail inexistente', async () => {
        const response = await request(process.env.BASE_URL)
            .post('/auth/login')
            .send({
                email: 'usuario_inexistente@teste.com',
                password: 'qualquerSenha123'
            });

        expect(response.status).to.not.equal(200);
        expect(response.body).to.not.have.property('accessToken');
    });

    it('CT04 - Não deve logar sem e-mail', async () => {
        const response = await request(process.env.BASE_URL)
            .post('/auth/login')
            .send({
                password: process.env.PASSWORD
            });

        expect(response.status).to.not.equal(200);
    });

    it('CT05 - Não deve logar sem senha', async () => {
        const response = await request(process.env.BASE_URL)
            .post('/auth/login')
            .send({
                email: process.env.EMAIL
            });

        expect(response.status).to.not.equal(200);
    });
});