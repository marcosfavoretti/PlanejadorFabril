import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";

export class GetTabelaProducaoDiarioDTO {
    @ApiProperty()
    @IsNumber()
    id: number;

    @ApiProperty()
    @IsDate()
    date_planej: Date;


    @ApiProperty()
    @IsString()
    item: string;


    @ApiProperty()
    @IsEnum(() => CODIGOSETOR)
    setor: CODIGOSETOR;

    @ApiProperty()
    @IsNumber()
    planejamento: number;

    @ApiProperty()
    @IsNumber()
    produzido: number;
}