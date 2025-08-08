FROM node:24-alpine as depend

LABEL app="as-study"
LABEL version="1.0"

WORKDIR /usr/src/build/app

COPY . ./

RUN npm install

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main.js"]