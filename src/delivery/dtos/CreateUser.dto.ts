import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserDto {
    @ApiProperty(
        {
            example: 'admin'
        }
    )
    @IsString()
    name: string;
    @ApiProperty(
        {
            example: 'admin'
        }
    )
    @IsString()
    password: string;
    @ApiProperty(
        {
            example: 'admin@gmail.com'
        }
    )
    @IsString()
    email: string;
}