FROM node:18-alpine3.16
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
EXPOSE 6969
CMD ["npm", "run", "dev"]