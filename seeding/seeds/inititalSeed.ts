// @/src/db/seeding/seeds/initialSeed.ts
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

import PropertyEntity from '../../src/model/PropertyEntity';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const properties = await factory(PropertyEntity)().createMany(15);
  }
}
