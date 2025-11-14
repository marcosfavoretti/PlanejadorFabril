import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitySchema, MixedList } from 'typeorm';

export function typeormSqlLiteConfig(
  entities: MixedList<EntitySchema<any> | Function>,
): DynamicModule {
  return TypeOrmModule.forRoot({
    type: 'sqlite',
    logging: false,
    database: 'database.db',
    synchronize: true,
    entities: entities,
  });
}
