FROM node:20.12.0

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .
RUN chmod +x ./wait-for-it.sh ./docker-entrypoint.sh

# Wait for DB_HOST:3306 before running the server
# CMD ./wait-for-it.sh -t 60 $DB_HOST:3306 -- node index.js

ENTRYPOINT [ "./docker-entrypoint.sh" ]
CMD ["node", "index.js"]