import { forwardRef, Inject } from "@nestjs/common";
import { IValidaPlanejamento } from "../interfaces/IValidaPlanejamento";
import { IGerenciadorPlanejamentConsulta } from "../interfaces/IGerenciadorPlanejamentoConsulta";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Fabrica } from "../entities/Fabrica.entity";
import { ErroDeValidacao } from "../exception/ErroDeValidacao.exception";
import { IVerificaCapacidade } from "../interfaces/IVerificaCapacidade";
import { ConsultaPlanejamentoService } from "../../infra/service/ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "./PlanejamentoOverWriteByPedido.service";

export class ValidaCapacidade implements IValidaPlanejamento {
    constructor(
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamento: ConsultaPlanejamentoService,
        @Inject(forwardRef(() => IGerenciadorPlanejamentConsulta)) private gerenciamentoConsulta: IGerenciadorPlanejamentConsulta
    ) { }

    private verificacao: IVerificaCapacidade;

    async valide(fabrica: Fabrica, pedido: Pedido, planejamentosTemp: PlanejamentoTemporario[]): Promise<void> {
        const tempMap = new Map<string, PlanejamentoTemporario[]>();
        
        for (const p of planejamentosTemp) {
            const key = this.makeKey(p);
            const list = tempMap.get(key) ?? [];
            list.push(p);
            tempMap.set(key, list);
        }

        const planejamentoCorrente = await this.consultaPlanejamento.consultaPlanejamentoAtual(fabrica, new PlanejamentoOverWriteByPedidoService());

        const planejamentoCorrenteTemp = planejamentoCorrente.map(PlanejamentoTemporario.createByEntity);

        for (const temp of planejamentosTemp) {
            const key = this.makeKey(temp);
            const listaTemp = tempMap.get(key) ?? [];
            const temporariosSemAtual = listaTemp.filter(p => p !== temp);
            const podeAlocar = await this.gerenciamentoConsulta.possoAlocarNoDia(
                temp.dia,
                temp.setor,
                temp.item,
                temp.qtd,
                this.verificacao,
                planejamentoCorrenteTemp,
                temporariosSemAtual
            );
            if (!podeAlocar) {
                throw new ErroDeValidacao(`Tentativa de alocar carga excedente no dia ${temp.dia.toISOString()} setor ${temp.setor}`);
            }
        }
    }

    setVerificacao(verificacao: IVerificaCapacidade): void {
        this.verificacao = verificacao;
    }

    private makeKey(p: PlanejamentoTemporario): string {
        return `${p.dia.toISOString().slice(0, 10)}|${p.setor}|${p.item.getCodigo()}`;
    }
}