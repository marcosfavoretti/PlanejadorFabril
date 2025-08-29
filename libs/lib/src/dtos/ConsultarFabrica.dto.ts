import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ConsutlarFabricaDTO {
    @IsString()
    @ApiProperty()
    fabricaId: string;
}