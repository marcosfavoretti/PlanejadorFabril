import { Module } from "@nestjs/common";
import { MercadoServiceModule } from "./MercadosService.module";

@Module({
    imports: [MercadoServiceModule],
    providers: [],
    exports: []
})
export class MercadosModule { }