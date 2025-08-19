import { Inject } from "@nestjs/common";
import { Item } from "../../@core/entities/Item.entity";
import { IConverteItem } from "../../@core/interfaces/IConverteItem";
import { ItemService } from "./Item.service";
import * as axios from 'axios';

export class ConverteItem implements IConverteItem {

    @Inject(ItemService) private itemService: ItemService;

    async convete_para_000(partcode: string): Promise<Item> {
        return await this.itemService.consultarItem(partcode);
    }
    
    async convete_para_110(partcode: string): Promise<Item> {
        const { data } = await axios.get<{partcode: string}[]>(`http://192.168.99.102:4111/estrutura/controle?partcode=${partcode}`);
        const partcode_resolved = data[0].partcode;
        return await this.itemService.consultarItem(partcode_resolved);
    }
}