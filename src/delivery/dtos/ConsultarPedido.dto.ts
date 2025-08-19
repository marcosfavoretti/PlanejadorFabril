import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class ConsultartPorPedidoDto{
    @ApiProperty()
    @IsString()
    fabricaId: string;

    @ApiProperty()
    @IsNumber()
    pedidoId: number;
}