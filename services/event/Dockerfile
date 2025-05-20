FROM node:18.20.8-alpine

WORKDIR /event

COPY . .

RUN ls -al

RUN npm i --frozen-lockfile

RUN npm run build

CMD ["npm", "run", "start:prod"]
