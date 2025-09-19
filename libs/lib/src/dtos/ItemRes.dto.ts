import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Item } from "../modules/item/@core/entities/Item.entity";

export class ItemResDto {
    @ApiProperty()
    @IsString()
    Item: string;

    @ApiProperty()
    @IsString()
    tipo_item: string;

    static createByEntity(item: Item):ItemResDto{
        const dto = new ItemResDto()
        dto.Item = item.getCodigo();
        dto.tipo_item = item.tipo_item;
        return dto;
    }
}