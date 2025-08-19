import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "dotenv";
import * as path from 'path';
config();

function bancoPrincipal() {
    return process.env.BD === 'PROD' ?
        TypeOrmModule.forRoot({
            type: 'mssql',
            // logging: ['query'],
            logging: false,
            database: 'ETHOS_SYNECO_DEV',
            username: 'sa',
            password: 'ncssp',
            host: 'CERBERUS\\CERBERUS',
            synchronize: false,
            entities: [
                __dirname + '/../**/*.entity{.ts,.js}'
            ],
            options: {
                trustServerCertificate: true,
                encrypt: true,

            }
        }) :
        TypeOrmModule.forRoot({
            type: 'sqlite',
            // logging: ['query'],
            logging: false,
            database: 'database.db',
            synchronize: true,
            entities: [
                __dirname + '/../**/*.entity{.ts,.js}'
            ],

        });
}
@Module({
    imports: [
        bancoPrincipal(),
        TypeOrmModule.forRoot({
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
        }),
    ],
    providers: [],
    exports: []
})
export class TypeormDevConfigModule { }