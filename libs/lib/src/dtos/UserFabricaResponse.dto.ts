import { ApiProperty } from "@nestjs/swagger";
import { FabricaResponseDto } from "./FabricaResponse.dto";
import { IsBoolean } from "class-validator";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";

export class UserFabricaResponseDto {
    @ApiProperty()
    fabrica: FabricaResponseDto;

    @ApiProperty()
    @IsBoolean()
    expirada: boolean;

    static fromEntity(fabrica: Fabrica, expirada: boolean): UserFabricaResponseDto {
        const dto = new UserFabricaResponseDto();
        dto.fabrica = FabricaResponseDto.fromEntity(fabrica);
        dto.expirada = expirada;
        return dto;
    }
}