import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class SalvarTabelaProducaoDiarioDTO {
    @ApiProperty()
    @IsNumber()
    id: number;

    @ApiProperty()
    @IsNumber()
    produzido: number
}