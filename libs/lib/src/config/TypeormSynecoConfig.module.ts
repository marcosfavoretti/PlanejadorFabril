import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntitySchema, MixedList } from 'typeorm';

export function typeormSynecoConfig(
  entities: MixedList<EntitySchema<any> | Function>,
): DynamicModule {
  const config: TypeOrmModuleOptions = {
    type: 'mssql',
    logging: false,
    database: process.env.SQLDATABASE,
    username: process.env.SQLUSER,
    password: process.env.SQLSENHA,
    host: process.env.SQLHOST,
    entities: entities,
    synchronize: false,
    options: {
      trustServerCertificate: true,
      encrypt: true,
    },
  };
  !entities.length && Object.assign(config, { name: 'SYNECO_DB' });
  return TypeOrmModule.forRoot(config);
}
