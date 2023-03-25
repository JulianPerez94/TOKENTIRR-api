# Cart Project api

## Development

To use this project you need to have docker installed

1. Install dependencies

`yarn`

2. Use postgres

`docker-compose -f compose-local.yaml up`

3. Start App

`yarn start`

## Test

To execute test you need to have docker

1. Install dependencies

`yarn`

2. Create own network

`docker network create nginxproxy_net3`

3. Use postgres

`docker-compose -f compose-test.yaml up`

4. Run seeds

`yarn test-seed:run`

5. Start App

`yarn test`
