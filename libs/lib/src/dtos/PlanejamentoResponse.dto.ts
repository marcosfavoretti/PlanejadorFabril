import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity";

export class PlanejamentoResponseDTO {
    @ApiProperty()
    @IsInt()
    planejamentoId: number;

    @ApiProperty() 
    item: string;

    @ApiProperty() 
    setor: string;

    @ApiProperty()
    pedido: string;

    @ApiProperty()
    dia: Date;

    @ApiProperty()
    @IsInt()
    qtd: number;

    static fromEntity(entity: Planejamento): PlanejamentoResponseDTO {
        const dto = new PlanejamentoResponseDTO();
        dto.planejamentoId = entity.planejamentoId;
        dto.item = entity.item.Item; 
        dto.setor = entity.setor.codigo; 
        dto.pedido = String(entity.pedido.id); 
        dto.dia = entity.dia;
        dto.qtd = entity.qtd;
        return dto;
    }
}