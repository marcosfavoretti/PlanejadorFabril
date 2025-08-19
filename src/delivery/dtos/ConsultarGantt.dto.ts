import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ConsultarGanttDTO {
    @ApiProperty()
    @IsString()
    fabricaId: string;
}