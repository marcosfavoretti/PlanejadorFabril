import { Item } from "../entities/Item.entity";

export interface IConverteItem {
    convete_para_000(partcode: string): Promise<Item>;
    convete_para_110(partcode: string): Promise<Item>;
}
export const IConverteItem = Symbol('IConverteItem');
