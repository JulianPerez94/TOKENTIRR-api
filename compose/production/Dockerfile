FROM node:16.17.1-alpine3.15

COPY . /app

WORKDIR /app

EXPOSE 8000

RUN yarn --frozen-lockfile && \
    adduser \
        --disabled-password \
        --no-create-home \
        node-user

USER node-user

CMD ["yarn", "start"]