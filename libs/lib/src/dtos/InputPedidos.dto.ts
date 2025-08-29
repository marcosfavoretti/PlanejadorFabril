import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class InputPedidosDTO {
    @IsNumber({}, { each: true })
    @ApiProperty({ type: [Number] })
    pedidoIds: number[];
}