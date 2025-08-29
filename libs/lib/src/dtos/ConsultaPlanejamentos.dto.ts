import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsOptional, IsString } from "class-validator";

export class ConsultaPlanejamentosDTO {
    @ApiProperty()
    @IsString()
    fabricaId: string;

    @ApiProperty({ type: String, format: 'date', example: '07-07-2025', description: 'Formato: dd-MM-yyyy' })
    @IsString()
    dataInicial: string;

    @ApiProperty({ type: String, nullable: true, required: false,  format: 'date', example: '07-07-2025', description: 'Formato: dd-MM-yyyy' })
    @IsOptional()
    @IsString()
    dataFinal?: string;
}