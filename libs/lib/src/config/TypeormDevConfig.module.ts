import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "dotenv";
import { User } from "../modules/user/@core/entities/User.entity";
import { Fabrica } from "../modules/fabrica/@core/entities/Fabrica.entity";
import { Planejamento } from "../modules/planejamento/@core/entities/Planejamento.entity";
import { PlanejamentoSnapShot } from "../modules/fabrica/@core/entities/PlanejamentoSnapShot.entity";
import { DividaSnapShot } from "../modules/fabrica/@core/entities/DividaSnapShot.entity";
import { Divida } from "../modules/fabrica/@core/entities/Divida.entity";
import { Pedido } from "../modules/pedido/@core/entities/Pedido.entity";
import { Item } from "../modules/item/@core/entities/Item.entity";
import { ItemCapabilidade } from "../modules/item/@core/entities/ItemCapabilidade.entity";
import { Setor } from "../modules/setor/@core/entities/Setor.entity";
import { MercadoSnapShot } from "../modules/fabrica/@core/entities/MercadoSnapShot.entity";
import { Mercado } from "../modules/mercados/@core/entities/Mercados.entity";
import { TabelaProducao } from "../modules/planejamento/@core/entities/TabelaProducao.entity";
import { MergeRequest } from "../modules/fabrica/@core/entities/MergeRequest.entity";
import { typeormOracleConfig } from "./TypeormOracleConfig.module";
import { typeormSqlLiteConfig } from "./TypeormSqlLiteConfig.module";
import { typeormSynecoConfig } from "./TypeormSynecoConfig.module";
import { Cargo } from "../modules/cargos/@core/entities/Cargo.entity";
import { GerenciaCargo } from "../modules/cargos/@core/entities/GerenciaCargo.entity";
config();

const entities = [
    Cargo,
    GerenciaCargo,
    MergeRequest,
    User,
    Fabrica,
    Planejamento,
    PlanejamentoSnapShot,
    DividaSnapShot,
    Divida,
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
        typeormSynecoConfig(entities) :
        typeormSqlLiteConfig(entities)
}
@Module({
    imports: [
        bancoPrincipal(),
        typeormOracleConfig()
    ],
    providers: [],
    exports: []
})
export class TypeormDevConfigModule { }