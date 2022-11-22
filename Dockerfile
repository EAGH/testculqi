FROM node:14
WORKDIR /home/testculqi
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]