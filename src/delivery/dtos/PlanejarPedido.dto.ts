import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class PlanejarPedidoDTO {
    @IsNumber({}, { each: true })
    @ApiProperty({ type: [Number] })
    pedidoIds: number[];
}