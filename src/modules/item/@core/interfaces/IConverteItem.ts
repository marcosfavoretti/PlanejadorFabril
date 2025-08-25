import { Item } from "../entities/Item.entity";

export interface IConverteItem {
    converter(partcode: string): Promise<Item>;
}
export const IConverteItem = Symbol('IConverteItem');
