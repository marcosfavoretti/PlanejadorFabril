import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { CargoEnum } from "../modules/cargos/@core/enum/CARGOS.enum";

export class SetUserCargoDTO {
    @ApiProperty({
        enum: CargoEnum
    })
    @IsEnum(CargoEnum)
    cargo: CargoEnum;

    @ApiProperty()
    @IsString()
    userId: string;
}