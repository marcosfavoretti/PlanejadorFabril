import { ApiProperty } from "@nestjs/swagger";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";

export class PedidoResponseDTO {
    @ApiProperty()
    id: number;

    @ApiProperty()
    codigo: string;

    @ApiProperty()
    dataEntrega: Date;

    @ApiProperty()
    isfake: boolean;

    @ApiProperty()
    lote: number;

    @ApiProperty()
    processado: boolean;

    @ApiProperty()
    item: string;

    static fromEntity(pedido: Pedido): PedidoResponseDTO {
        const novo = new PedidoResponseDTO();
        novo.codigo = pedido.codigo;
        novo.dataEntrega = pedido.dataEntrega;
        novo.id = pedido.id;
        novo.item = pedido.item?.Item || 'FALTANDO_CADASTRO';
        novo.lote = pedido.lote;
        novo.processado = pedido.processado;
        return novo;
    }
}