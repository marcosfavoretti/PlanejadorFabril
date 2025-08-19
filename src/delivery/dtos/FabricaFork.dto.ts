import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class FabricaForkDTO {
    @IsString()
    @ApiProperty()
    userId: string;
}