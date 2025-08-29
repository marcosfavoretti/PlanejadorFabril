import { Inject } from "@nestjs/common";
import { Mercado } from "../classes/Mercado";
import { TabelaProducaoService } from "@libs/lib/modules/planejamento/infra/services/TabelaProducao.service";
import { ISyncProducao } from "../interfaces/ISyncProducao";
import { ISyncProducaoFalha } from "../interfaces/ISyncProducaoFalha";
import { Setor } from "@libs/lib/modules/setor/@core/entities/Setor.entity";
import { TabelaProducao } from "@libs/lib/modules/planejamento/@core/entities/TabelaProducao.entity";

export class SyncMercadoManual implements ISyncProducao, ISyncProducaoFalha {
    constructor(
        @Inject(TabelaProducaoService) private tabelaProducaoService: TabelaProducaoService
    ) { }
    
    async syncProducao(setor: Setor, date: Date): Promise<Mercado> {
        try {
            const ultimoDiaLog = await this.tabelaProducaoService.consultarUltimoDia(date, setor.codigo);
            const targetMercado = new Mercado(setor);
            if (!ultimoDiaLog.length) { 
                return targetMercado;
            }
            ultimoDiaLog.forEach(log =>
                targetMercado.addEstoque(log.planejamento.item, log.produzido)
            );
            return targetMercado;
        } catch (error) {
            console.error(error);
            throw new Error(`nao foi possivel a sync ${error.message}`);
        }
    }   

    async syncProducaFalha(setor: Setor, date: Date): Promise<TabelaProducao[]> {
        try {
            const ultDiaFalhasLog = await this.tabelaProducaoService.consultarFalhasUltimoDia(date, setor.codigo);
            return ultDiaFalhasLog;
        } catch (error) {
            console.error(error)
            throw new Error(`nao foi possível a sync ${error.message}`)
        }
    }
}