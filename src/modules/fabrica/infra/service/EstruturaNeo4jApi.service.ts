import { Item } from "src/modules/item/@core/entities/Item.entity";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { IConsultaRoteiro } from "../../@core/interfaces/IConsultaRoteiro";
import { clientAxios } from "src/config/AxiosClient";
import { IConverteItem } from "src/modules/item/@core/interfaces/IConverteItem";
import { Inject, InternalServerErrorException } from "@nestjs/common";
import { ItemService } from "src/modules/item/infra/service/Item.service";
import { IBuscarItemDependecias } from "src/modules/item/@core/interfaces/IBuscarItemDependecias";

export class EstruturaNeo4jApiService
    implements
    IConsultaRoteiro,
    IConverteItem,
    IBuscarItemDependecias {

    @Inject(ItemService) private itemService: ItemService;

    private client = clientAxios;

    async roteiro(partcode: Item): Promise<CODIGOSETOR[]> {
        try {
            const { data } = await this.client.get<string[]>('/estrutura/roteiro', { params: { partcode: partcode.getCodigo() } });
            return data as CODIGOSETOR[];
        } catch (error) {
            throw new Error(`Servico de estrutura offline (ROTEIRO) ${error.status} ${error.message}`);
        }
    }

    async buscar(item: Item): Promise<Item[]> {
        try {
            const { data } = await this.client.get<{ partcode: string }[]>(`/estrutura/controle`, {
                params: { partcode: item.getCodigo() }
            });
            return await this.itemService.consultarItens(data.map(d => d.partcode));
        } catch (error) {
            throw new Error(`Servico de estrutura offline (BUSCAR) ${error.status} ${error.message}`);
        }
    }

    async converter(partcode: string): Promise<Item> {
        try {
            const { data } = await this.client.get<{ partcode: string }[]>(`/estrutura/controle`, {
                params: { partcode }
            });
            const partcode_resolved = data.at(data.length-1);
            if (!partcode_resolved) throw new InternalServerErrorException('Partcode nao foi resolvido corretamente');
            return await this.itemService.consultarItem(partcode_resolved!.partcode);
        } catch (error) {
            throw new Error(`Servico de estrutura offline (CONVERSAO) ${error.status} ${error.message}`);
        }
    }
}