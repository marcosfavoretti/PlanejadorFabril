import { DynamicModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

export function typeormOracleConfig(): DynamicModule {
  return TypeOrmModule.forRoot({
    type: 'oracle',
    name: 'LOGIX',
    host: process.env.ORACLEHOST,
    port: Number(process.env.ORACLEPORT),
    username: process.env.ORACLEUSER,
    password: process.env.ORACLEPASSWORD,
    sid: process.env.ORACLESID,
    extra: {
      max: 10,
      connectionTimeout: 10000,
    },
    synchronize: false,
    logging: false,
    autoLoadEntities: false,
  });
}