import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "dotenv";
import { User } from "../modules/user/@core/entities/User.entity";
import { Fabrica } from "../modules/fabrica/@core/entities/Fabrica.entity";
import { Planejamento } from "../modules/planejamento/@core/entities/Planejamento.entity";
import { PlanejamentoSnapShot } from "../modules/fabrica/@core/entities/PlanejamentoSnapShot.entity";
import { DividaSnapShot } from "../modules/fabrica/@core/entities/DividaSnapShot.entity";
import { Divida } from "../modules/fabrica/@core/entities/Divida.entity";
import { Batelada } from "../modules/fabrica/@core/entities/Batelada.entity";
import { Pedido } from "../modules/pedido/@core/entities/Pedido.entity";
import { Item } from "../modules/item/@core/entities/Item.entity";
import { ItemCapabilidade } from "../modules/item/@core/entities/ItemCapabilidade.entity";
import { Setor } from "../modules/setor/@core/entities/Setor.entity";
import { MercadoSnapShot } from "../modules/fabrica/@core/entities/MercadoSnapShot.entity";
import { Mercado } from "../modules/mercados/@core/entities/Mercados.entity";
import { TabelaProducao } from "../modules/planejamento/@core/entities/TabelaProducao.entity";
config();

const entities = [
    User,
    Fabrica,
    Planejamento,
    PlanejamentoSnapShot,
    DividaSnapShot,
    Divida,
    Batelada,
    Pedido,
    Item,
    ItemCapabilidade,
    Setor,
    MercadoSnapShot,
    Mercado,
    TabelaProducao,
]

function bancoPrincipal() {
    return process.env.BD === 'PROD' ?
        TypeOrmModule.forRoot({
            type: 'mssql',
            logging: false,
            database: process.env.SQLDATABASE,
            username: process.env.SQLUSER,
            password: process.env.SQLSENHA,
            host: process.env.SQLHOST,
            synchronize: false,
            entities,
            options: {
                trustServerCertificate: true,
                encrypt: true,
            }
        }) :
        TypeOrmModule.forRoot({
            type: 'sqlite',
            logging: false,
            database: 'database.db',
            synchronize: false,
            entities,
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