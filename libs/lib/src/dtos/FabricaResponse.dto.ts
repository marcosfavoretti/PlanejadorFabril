import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";

export class FabricaResponseDto {
    @ApiProperty()
    fabricaId: string;
    @ApiProperty()
    date: Date;
    @ApiProperty()
    principal: boolean;
    @ApiProperty()
    checkPoint: boolean;
    @ApiProperty()
    autor: string;
    @IsOptional()
    @ApiProperty({ type: String, nullable: true })
    fabricaPai: string | null;
    static fromEntity(entity: Fabrica): FabricaResponseDto {
        const dto = new FabricaResponseDto();
        dto.fabricaId = entity.fabricaId;
        dto.date = entity.date;
        dto.principal = entity.principal;
        dto.checkPoint = entity.checkPoint;
        dto.autor = entity.user?.name || 'unkown';
        // Mapeia o fabricaPaiId para a propriedade fabricaPai no DTO
        dto.fabricaPai = entity.fabricaPai?.fabricaId || null;
        return dto;
    }
}