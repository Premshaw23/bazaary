# Dockerfile for Bazaary Backend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Set timezone to UTC
ENV TZ=UTC

RUN npm run build

CMD ["npm", "run", "start:prod"]
