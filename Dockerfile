FROM node:18-alpine

EXPOSE 3000

WORKDIR /app

COPY . .
RUN yarn install
RUN yarn build
CMD ["yarn", "start"]
