require('dotenv').config();

const request = require('supertest');
const { expect } = require('chai');

describe('Users - Me', () => {
    let accessToken;

    before(async () => {
        // O teste depende de um token válido, então validamos o login antes de seguir.
        const login = await request(process.env.BASE_URL)
            .post('/auth/login')
            .send({
                email: process.env.EMAIL,
                password: process.env.PASSWORD
            });

        // Se o login falhar, o restante da suíte não representa o cenário real.
        expect(login.status).to.equal(200);
        expect(login.body)
            .to.have.property('accessToken')
            .that.is.a('string')
            .and.is.not.empty;

        accessToken = login.body.accessToken;
    });

    it('CT01 - Deve retornar dados do usuário autenticado', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me')
            .set('Authorization', `Bearer ${accessToken}`);

        // Aqui validamos o contrato principal do endpoint autenticado.
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.be.an('object');
        expect(response.body.user).to.have.property('id');
        expect(response.body.user).to.have.property('email', process.env.EMAIL);
        expect(response.body.user).to.have.property('role');
    });

    it('CT02 - Não deve acessar sem token', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me');

        // Sem credencial, a API deve responder como não autorizada.
        expect(response.status).to.equal(401);
    });

    it('CT03 - Não deve acessar com token inválido', async () => {
        const response = await request(process.env.BASE_URL)
            .get('/users/me')
            .set('Authorization', 'Bearer token_invalido');

        // Token inválido também deve cair na mesma regra de autenticação.
        expect(response.status).to.equal(401);
    });
});
