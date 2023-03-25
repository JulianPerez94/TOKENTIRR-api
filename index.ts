/*
  This file contains the shims and initialization procedures needed by the
  system.
  You probably won't need to change this file any time soon.
 */
import 'reflect-metadata';
import * as rc from 'routing-controllers';
import * as td from 'typedi';
import * as dotenv from 'dotenv';
import { routingControllersToSpec } from 'routing-controllers-openapi';

dotenv.config();
rc.useContainer(td.Container);

import App from './App';
import schemas from './controllers/schemas';

const storage = rc.getMetadataArgsStorage();
const spec = routingControllersToSpec(
  storage,
  {},
  {
    definitions: schemas,
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
    },
  }
);

App.spec = spec;

export default App.main();
