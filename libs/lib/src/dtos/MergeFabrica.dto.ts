import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class MergeFabricaDto {
    @ApiProperty()
    @IsInt()
    mergeRequestId: number;
}