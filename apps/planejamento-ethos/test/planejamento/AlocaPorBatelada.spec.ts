import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { ItemCapabilidade } from "@libs/lib/modules/item/@core/entities/ItemCapabilidade.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { AlocaPorBatelada } from "@libs/lib/modules/planejamento/@core/services/AlocaPorBatelada";

describe('test of aloca por batelada', () => {
    let criaGerenciadorPlanejamentoMock = (): jest.Mocked<IGerenciadorPlanejamentConsulta> => ({
        diaParaAdiantarProducaoEncaixe: jest.fn().mockResolvedValue([]), // padrão vazio
        possoAlocarQuantoNoDia: jest.fn().mockResolvedValue(0),
        diaParaAdiantarProducao: jest.fn().mockResolvedValue([]),
        possoAlocarNoDia: jest.fn().mockResolvedValue(0),
    } as unknown as jest.Mocked<IGerenciadorPlanejamentConsulta>);

    let gerenciadorPlanejamentoMock = criaGerenciadorPlanejamentoMock();
    let service = new AlocaPorBatelada(gerenciadorPlanejamentoMock);
    it('dado uma producao futura maior que a quantidade possivel de alocar ele deve retroceder mais dias', () => {
        gerenciadorPlanejamentoMock.diaParaAdiantarProducaoEncaixe.mockResolvedValue([new Date()]);
        gerenciadorPlanejamentoMock.possoAlocarQuantoNoDia.mockResolvedValue(32);
        const item = new Item()
        item.Item = '20-000-00220';
        item.itemCapabilidade = [{ setor: CODIGOSETOR.BANHO, leadTime: 1 } as unknown as ItemCapabilidade]
        const pedido = new Pedido('22', new Date(), item, 32, false);
        const response = service.hookAlocacao(
            new Fabrica
            pedido,
            CODIGOSETOR.BANHO,
            []
        )
    })
});