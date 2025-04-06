# Use Node.js image
FROM node:22-slim

WORKDIR /app
COPY .env.local .env.local

COPY package.json package-lock.json ./
RUN npm install 

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
