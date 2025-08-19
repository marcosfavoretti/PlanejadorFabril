import { ApiProperty } from "@nestjs/swagger";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { Divida } from "src/modules/fabrica/@core/entities/Divida.entity";

export class PedidoSlimResponseDTO {
    @ApiProperty()
    id: number;

    @ApiProperty()
    codigo: string;

    @ApiProperty()
    dataEntrega: Date;

    @ApiProperty()
    lote: number;

    @ApiProperty()
    item: string;
}


class DividaSlimResponseDTO {
    @ApiProperty()
    qtd: number;

    @ApiProperty()
    setorCodigo: string;
}

export class PedidosPlanejadosResponseDTO {
    @ApiProperty()
    pedido: PedidoSlimResponseDTO;

    @ApiProperty(
        {
            type: DividaSlimResponseDTO,
            isArray: true
        }
    )
    dividas: DividaSlimResponseDTO[];

    static fromEntity(pedido: Pedido, dividas: Divida[]): PedidosPlanejadosResponseDTO {
        const dto = new PedidosPlanejadosResponseDTO();

        dto.pedido = {
            id: pedido.id,
            codigo: pedido.codigo,
            dataEntrega: pedido.dataEntrega,
            lote: pedido.lote,
            item: pedido.item.Item,
        };

        dto.dividas = dividas.map(divida => ({
            ...divida,
            setorCodigo: divida.setor.codigo,
        }));

        return dto;
    }

}