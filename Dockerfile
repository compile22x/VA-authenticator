FROM node:20
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
RUN mkdir -p /usr/src/app/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /usr/src/app/ssl/domain.key \
    -out /usr/src/app/ssl/domain.crt \
    -subj "/CN=localhost" && \
    cp /usr/src/app/ssl/domain.crt /usr/src/app/ssl/root.crt
CMD ["node", "server.js"]
