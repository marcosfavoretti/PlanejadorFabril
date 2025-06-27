import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            logging: ['error'],
            database: process.env.DB_NAME || 'database.db',
            synchronize: true,
            entities: [
                __dirname + '/../**/*.entity{.ts,.js}'
            ]
        })
    ],
    providers: [],
    exports: []
})
export class TypeormDevConfigModule {

}