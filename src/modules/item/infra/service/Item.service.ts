import { Inject, Injectable } from "@nestjs/common";
import { ItemRepository } from "../repository/Item.repository";
import { Item } from "../../@core/entities/Item.entity";

export class ItemService {
    constructor(
        @Inject(ItemRepository) private itemRepository: ItemRepository
    ) { }

    async salvarItem(item: Item):Promise<Item>{
        return await this.itemRepository.save(item);
    }

    async consultarItem(partcode: string): Promise<Item> {
        return await this.itemRepository.findOneOrFail({
            where: {
                Item: partcode
            }
        });
    }

    async consultarItens(): Promise<Item[]> {
        return await this.itemRepository.find();
    }
}