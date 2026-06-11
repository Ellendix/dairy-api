# Testes Automatizados de API — DairyApp

Este projeto contém testes automatizados de API para validar fluxos críticos da plataforma DairyApp, utilizando:

* Node.js
* Mocha
* Chai
* Supertest
* dotenv

## Objetivo

Garantir que os principais endpoints da aplicação estejam funcionando corretamente, validando autenticação, autorização, dados do usuário, plano, consumo e checkout.

---

## Estrutura dos Testes

```text
tests/
  ia/
    users/
      login.spec.js
      me.spec.js
      plan.test.js
      usage.test.js
      checkout.test.js
```


# Cobertura Atual de API

## 1. Autenticação — Login

### Endpoint

```text
POST /auth/login
```

### Casos cobertos

* Login com credenciais válidas
* Login com senha inválida
* Login com usuário inexistente
* Login sem e-mail
* Login sem senha

### Impacto

Valida o principal ponto de entrada da aplicação e garante que:

* usuários legítimos conseguem acessar;
* credenciais inválidas são bloqueadas;
* campos obrigatórios são tratados corretamente;
* tokens de autenticação são retornados no login válido.

### Risco mitigado

* Falhas de autenticação
* Acesso indevido
* Quebra de login após deploy
* Problemas de validação de payload
* Retorno incorreto de tokens

---

## 2. Autorização e Identidade do Usuário

### Endpoint

```text
GET /users/me
```

### Casos cobertos

* Consulta de usuário autenticado
* Consulta sem token
* Consulta com token inválido

### Impacto

Valida que a API reconhece corretamente o usuário autenticado e protege informações pessoais.

Também garante que rotas privadas não possam ser acessadas sem autenticação válida.

### Risco mitigado

* Vazamento de dados
* Falhas de autorização
* Quebra de autenticação JWT
* Acesso indevido a recursos protegidos

---

## 3. Plano do Usuário

### Endpoint

```text
GET /users/me/plan
```

### Casos cobertos

* Consulta do plano do usuário autenticado
* Consulta do plano sem token
* Consulta do plano com token inválido

### Impacto

Valida que a API retorna corretamente as informações de plano do usuário autenticado e bloqueia acesso sem autenticação.

### Risco mitigado

* Exposição indevida de dados de plano
* Falha na proteção de rota privada
* Inconsistência na consulta de assinatura/plano
* Acesso com token inválido

---

## 4. Consumo do Usuário

### Endpoint

```text
GET /users/me/usage
```

### Casos cobertos

* Consulta do consumo do usuário autenticado
* Consulta de consumo sem token
* Consulta de consumo com token inválido

### Impacto

Valida que a API retorna corretamente os dados de uso/consumo do usuário, como limite ou utilização de recursos da plataforma.

Também garante que dados de consumo não sejam acessados sem autenticação.

### Risco mitigado

* Vazamento de dados de consumo
* Falha na regra de autenticação
* Exibição incorreta de uso do plano
* Quebra de controle de limite/uso

---

## 5. Checkout e Assinaturas

### Endpoints

```text
GET /plans
POST /subscriptions/checkout
GET /users/me
```

### Casos cobertos

* Consulta de planos disponíveis
* Identificação dos planos Pro e Business
* Tentativa de checkout para plano Pro
* Tentativa de checkout para plano Business
* Validação de pagamento recusado
* Tentativa de checkout com plano inexistente
* Tentativa de checkout sem autenticação
* Tentativa de alteração de preço pelo payload
* Tentativa de envio de `userId` no payload
* Tentativa de ativação manual de assinatura pelo payload
* Tentativa de checkout para plano gratuito
* Garantia de que falha no checkout não deve alterar o plano do usuário

### Impacto

Valida o fluxo principal de monetização da plataforma, garantindo que a API trate corretamente planos, autenticação, payloads inválidos e pagamento recusado.

Também garante que o plano do usuário não seja ativado indevidamente quando o pagamento falha.

### Risco mitigado

* Ativação indevida de plano pago
* Manipulação de preço pelo cliente
* Alteração indevida de plano
* Checkout sem autenticação
* Inconsistência entre pagamento e assinatura
* Falhas de validação de payload
* Escalada de privilégio via payload
* Cobrança ou assinatura indevida

---

## Como executar os testes

### Executar todos os testes de API

```bash
npx mocha "tests/**/*.js" --timeout 15000
```

### Executar teste de login

```bash
npx mocha tests/ia/users/login.spec.js --timeout 15000
```

### Executar teste de usuário autenticado

```bash
npx mocha tests/ia/users/me.spec.js --timeout 15000
```

### Executar teste de plano

```bash
npx mocha tests/ia/users/plan.test.js --timeout 15000
```

### Executar teste de consumo

```bash
npx mocha tests/ia/users/usage.test.js --timeout 15000
```

### Executar teste de checkout

```bash
npx mocha tests/ia/users/checkout.test.js --timeout 15000
```

---

## Observação sobre Checkout

O ambiente atual utiliza fluxo de pagamento real. Por isso, os testes de checkout foram estruturados para validar cenários seguros, como:

* autenticação;
* payload inválido;
* plano inexistente;
* pagamento recusado;
* proteção contra manipulação de dados;
* garantia de que falha no pagamento não ativa plano.

Não devem ser automatizados cenários de pagamento aprovado enquanto não existir ambiente sandbox, mock de pagamento ou usuário interno de teste sem cobrança real.

---

## Boas práticas aplicadas

* Uso de `.env` para dados sensíveis
* Separação dos testes por funcionalidade
* Validação de status HTTP
* Validação de contrato básico da resposta
* Testes positivos e negativos
* Validação de autenticação em rotas privadas
* Cobertura de segurança de payload no checkout

---
