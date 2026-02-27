FROM node:latest
WORKDIR /app
ADD package*.json ./
COPY . .
RUN npm install
EXPOSE 5050
CMD ["node", "index.js"]