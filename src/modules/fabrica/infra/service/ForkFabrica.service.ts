import { Inject, Logger } from "@nestjs/common";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { ForkFabricaProps } from "../../@core/classes/ForkFabricaProps";
import { IGeraCheckPoint } from "../../@core/interfaces/IGeraCheckPoint";
import { FabricaService } from "./Fabrica.service";

export class ForkFabricaService {

    private readonly CHECKPOINT_RANGE = Number(process.env.CHECKPOINT_RANGE);
    private logger = new Logger();

    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject('CHECKPOINT_SERVICES') private checkpoints_services: Array<IGeraCheckPoint>
    ) { }

    async fork(props: ForkFabricaProps): Promise<Fabrica> {
        const fabricaCopy = props.fabrica.copy(props.user, props.isPrincipal);
        await this.aplicarCheckpointSeNecessario(fabricaCopy, props);
        return fabricaCopy;
    }

    /**
     * 
     * @param fabricaAtual 
     * @param props 
     * @description quando o numero de ancestrais é igual o range definido na variavel de ambiente ele cria um checkpoint na nova fabrica gerada, garantido que todo estado futuro tenha uma copia nessa nova fabrica
     */
    private async aplicarCheckpointSeNecessario(fabricaAtual: Fabrica, props: ForkFabricaProps): Promise<void> {
        const ancestrais = await this.fabricaService.consultarFabricasAteCheckPoint(props.fabrica);
        if (props.isPrincipal && ancestrais.length === this.CHECKPOINT_RANGE) {
            this.logger.log('CRIANDO CHECKPOINT PARA FABRICA ✨', 'FORK SERVICE');
            fabricaAtual.enableCheckPoint();
            for (const checkpoint of this.checkpoints_services) {
                await checkpoint.gerar(fabricaAtual, props.fabrica);
            }
        }
    }
}