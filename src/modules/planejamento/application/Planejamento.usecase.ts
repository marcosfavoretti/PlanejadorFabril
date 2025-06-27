import { Inject, InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import { FabricaService } from "../@core/services/Fabrica.service";
import { PedidoRepository } from "../infra/repositories/Pedido.repo";
import { TabelaProducaoRepository } from "src/modules/producao-simulacao/infra/repositories/TabelaProducao.repository";
import { Repository } from "typeorm";
import { TabelaProducao } from "src/modules/producao-simulacao/@core/entities/TabelaProducao.entity";
import { PlanejamentoDiarioDisplay } from "src/modules/shared/@core/classes/PlanejamentoJson";
import { PlanejamentoDiario } from "../@core/entities/PlanejamentoDiario.entity";
import { IGerenciadorPlanejamentConsulta } from "../@core/interfaces/IGerenciadorPlanejamentoConsulta";

/**
 * @description responsavel para sincronizar os pedido com os planejamentos da firma
 */
export class PlanejamentoUseCase {
    @Inject(FabricaService) private fabricaService: FabricaService;
    @Inject(PedidoRepository) private pedidoRepo: PedidoRepository;
    @Inject(IGerenciadorPlanejamentConsulta) private gerenciadorPlanejamento: IGerenciadorPlanejamentConsulta;
    @Inject(TabelaProducaoRepository) private tabelaRepo: Repository<TabelaProducao>;
    async planeje(): Promise<any> {
        try {
            const pedidos = await this.pedidoRepo.find({
                where: {
                    processado: false
                }
            })
            if (!pedidos.length) return;
            //posso usar o retorno disso aqui sem precisar acoplar em gerenciador. SO tenho tomar cuidado com duplicidade
            await this.fabricaService.planejamento(pedidos);
            const diasAlocados: PlanejamentoDiario[] = await this.gerenciadorPlanejamento
                .getPlanejamentoByPedido(...pedidos);
            console.log(diasAlocados);
            
            const tabelas: TabelaProducao[] = diasAlocados.flatMap(dia =>
                dia.planejamentos.map(p =>
                    this.tabelaRepo.create({
                        date_planej: dia.dia,
                        planejamento: p,
                    })
                )
            );
            await this.tabelaRepo.save(tabelas);
            pedidos.forEach(p => p.processado = true);
            await this.pedidoRepo.save(pedidos);
            console.log(diasAlocados)
            // return PlanejamentoDiarioDisplay.console(diasAlocados);
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException('Não foi possível consultar os pedidos ou aloca-los');
        }
    }

    async onModuleInit(): Promise<void> {
        await this.planeje();
    }
}