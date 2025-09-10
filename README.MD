# Simula Aposentadoria

Simula Aposentadoria é um projeto desenvolvido para calcular a aposentadoria de um usuário. É uma evolução de um trabalho acadêmico feito no 3º semestre da faculdade, aprimorado com **Node.js**, **MongoDB**, **HTML** e **CSS**.

O sistema permite que o usuário insira seus dados profissionais e salariais para estimar o valor da aposentadoria.

## Funcionalidades

- Cadastro de funcionários com:
  - Nome
  - Data de contratação
  - Anos de contribuição
  - Salário
- Cálculo automático do valor estimado de aposentadoria.
- Armazenamento de dados no **MongoDB**.
- Interface web simples para interação com o usuário.

## Tecnologias Utilizadas

- **Node.js**: Servidor e lógica do cálculo.  
- **Express.js**: Framework para criar rotas e gerenciar requisições HTTP.  
- **MongoDB**: Banco de dados para armazenar informações de funcionários, salários e aposentadorias.  
- **Mongoose**: ODM para manipular dados do MongoDB com esquemas.  
- **HTML/CSS**: Interface do usuário no frontend.  
- **Body-parser**: Para processar dados enviados via formulário.

## Estrutura do Projeto

- `server.js` → Código principal do backend com Express, MongoDB e lógica de cálculo.  
- `public/` → Contém os arquivos **HTML, CSS** e scripts do frontend.  
- `.env` → Arquivo com variáveis de ambiente (como `DB_URI` e `PORT`).

## Banco de Dados

O projeto possui três coleções principais no MongoDB:

1. **Funcionario**  
   - Nome: String  
   - Dt_contratacao: Date  
   - Anos_contribuicao: Number  

2. **Salario**  
   - funcionario_id: referência para Funcionario  
   - Valor_Bruto: Number  
   - Dt_ajuste: Date  

3. **Aposentadoria**  
   - funcionario_id: referência para Funcionario  
   - Valor_estimado: Number  
   - Dt_calculo: Date  

## Cálculo da Aposentadoria

O cálculo é feito de forma simples:

valorEstimado = salario * 0.08 * anosDeContribuicao



Ou seja, 8% do salário multiplicado pelos anos de contribuição.

## Rotas Disponíveis

- `GET /` → Retorna a página inicial do formulário (`index.html`).  
- `POST /enviar` → Recebe os dados do formulário e:
  1. Salva o funcionário no banco.
  2. Salva o salário do funcionário.
  3. Calcula e salva o valor estimado da aposentadoria.
  4. Retorna o valor estimado em JSON.

### Exemplo de Requisição POST

```json
POST /enviar
{
  "name": "João Silva",
  "dataContratacao": "2015-03-20",
  "tempoContribuicao": 10,
  "salario": 5000
}


{
  "valorEstimado": 4000.00
}
