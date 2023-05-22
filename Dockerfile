FROM node:18-alpine

ENV SHOPIFY_API_KEY=754c9e98946bc21bcc487320205e90c2
ENV FRONTEND_URL=https://app.bitbybit.studio
EXPOSE 3000
WORKDIR /app

ARG NPM_TOKEN

COPY . .
RUN yarn install
RUN yarn build
CMD ["yarn", "start"]
