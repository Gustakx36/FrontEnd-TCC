FROM node:20-alpine

WORKDIR /app

# instalar dependências
COPY package*.json ./
RUN npm install

# copiar o restante do código
COPY . .

# expor porta padrão do Next
EXPOSE 3000

# comando padrão
CMD ["npm", "run", "dev"]