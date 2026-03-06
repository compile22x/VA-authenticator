FROM node:16
EXPOSE 19408 19001
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY *.js ./
COPY ./auth_server ./auth_server/
COPY ./helpers ./helpers/
COPY ./database ./database/
COPY ./routes ./routes/
COPY ./views ./views/
COPY ./public ./public/
COPY server.config ./
CMD ["node", "server.js"]




