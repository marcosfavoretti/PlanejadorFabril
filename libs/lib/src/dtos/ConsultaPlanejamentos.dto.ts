import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsOptional, IsString } from "class-validator";

export class ConsultaPlanejamentosDTO {
    @ApiProperty()
    @IsString()
    fabricaId: string;

    @ApiProperty({ type: Date })
    @IsString()
    dataInicial: Date;

    @ApiProperty({ type: Date })
    @IsOptional()
    @IsString()
    dataFinal?: Date;
}