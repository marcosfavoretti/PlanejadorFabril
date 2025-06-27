import { Inject } from "@nestjs/common";
import { Mercado } from "../classes/Mercado";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { TabelaProducaoService } from "src/modules/producao-simulacao/infra/services/TabelaProducao.service";
import { ISyncProducao } from "../interfaces/ISyncProducao";
import { ISyncProducaoFalha } from "../interfaces/ISyncProducaoFalha";
import { TabelaProducao } from "src/modules/producao-simulacao/@core/entities/TabelaProducao.entity";

export class SyncMercadoManual implements ISyncProducao, ISyncProducaoFalha {
    constructor(
        @Inject(TabelaProducaoService) private tabelaProducaoService: TabelaProducaoService
    ) { }
    
    async syncProducao(setor: CODIGOSETOR, date: Date): Promise<Mercado> {
        try {
            const ultimoDiaLog = await this.tabelaProducaoService.consultarUltimoDia(date, setor);
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

    async syncProducaFalha(setor: CODIGOSETOR, date: Date): Promise<TabelaProducao[]> {
        try {
            const ultDiaFalhasLog = await this.tabelaProducaoService.consultarFalhasUltimoDia(date, setor);
            return ultDiaFalhasLog;
        } catch (error) {
            console.error(error)
            throw new Error(`nao foi possível a sync ${error.message}`)
        }
    }
}