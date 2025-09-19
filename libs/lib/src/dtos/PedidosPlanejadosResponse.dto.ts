import { ApiProperty } from "@nestjs/swagger";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { Divida } from "@libs/lib/modules/fabrica/@core/entities/Divida.entity";
import { ItemResDto } from "./ItemRes.dto";

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
    item: ItemResDto;
}



class DividaSlimResponseDTO {
    @ApiProperty()
    qtd: number;

    @ApiProperty()
    setorCodigo: string;

    @ApiProperty()
    item: ItemResDto;
}

class AtrasoSlimResponseDTO extends DividaSlimResponseDTO { }
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

    @ApiProperty(
        {
            type: AtrasoSlimResponseDTO,
            isArray: true
        }
    )
    atrasos: AtrasoSlimResponseDTO[];


    // static fromEntity(pedido: Pedido, dividas: Divida[], atrasos: AtrasoSlimResponseDTO[]): PedidosPlanejadosResponseDTO {
    //     const dto = new PedidosPlanejadosResponseDTO();

    //     dto.pedido = {
    //         id: pedido.id,
    //         codigo: pedido.codigo,
    //         dataEntrega: pedido.dataEntrega,
    //         lote: pedido.lote,
    //         item: pedido.item.Item,
    //     };

    //     dto.dividas = dividas.map(divida => ({
    //         ...divida,
    //         item: divida.item.getCodigo(),
    //         setorCodigo: divida.setor.codigo,
    //     }));

    //     dto.atrasos = dividas.map(divida => ({
    //         ...divida,
    //         item: divida.item.getCodigo(),
    //         setorCodigo: divida.setor.codigo,
    //     }));

    //     return dto;
    // }

}