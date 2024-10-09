FROM node:21.1.0-alpine3.18
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
EXPOSE 6969
CMD ["npm", "run", "dev"]