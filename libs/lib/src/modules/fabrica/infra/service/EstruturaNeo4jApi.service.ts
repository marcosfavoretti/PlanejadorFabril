import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';
import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';
import { IConsultaRoteiro } from '../../../item/@core/interfaces/IConsultaRoteiro';
import { clientAxios } from '@libs/lib/config/AxiosClient';
import { IConverteItem } from '@libs/lib/modules/item/@core/interfaces/IConverteItem';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { ItemService } from '@libs/lib/modules/item/infra/service/Item.service';
import { IBuscarItemDependecias } from '@libs/lib/modules/item/@core/interfaces/IBuscarItemDependecias';
import { ItemEstruturado } from '../../../item/@core/classes/ItemEstruturado';
import { IMontaEstrutura } from '../../../item/@core/interfaces/IMontaEstrutura.ts';

export class EstruturaNeo4jApiService
  implements
    IConsultaRoteiro,
    IConverteItem,
    IBuscarItemDependecias,
    IMontaEstrutura
{
  @Inject(ItemService) private itemService: ItemService;

  private client = clientAxios;

  async roteiro(partcode: Item): Promise<CODIGOSETOR[]> {
    try {
      const { data } = await this.client.get<string[]>('/estrutura/roteiro', {
        params: { partcode: partcode.getCodigo() },
      });
      return data as CODIGOSETOR[];
    } catch (error) {
      console.error(`item com problema`, partcode);
      throw new Error(
        `Servico de estrutura offline (ROTEIRO) ${error.status} ${error.message}`,
      );
    }
  }

  async monteEstrutura(item: Item): Promise<ItemEstruturado> {
    const itensDependentes = await this.buscar(item);
    const itemEstrutura = new ItemEstruturado();
    itemEstrutura.itemFinal = item;
    itemEstrutura.itemRops = itensDependentes[itensDependentes.length - 1];
    itemEstrutura.itensDependencia = itensDependentes.slice(
      0,
      itensDependentes.length - 1,
    );
    return itemEstrutura;
  }

  async buscar(item: Item): Promise<Item[]> {
    try {
      const { data } = await this.client.get<{ partcode: string }[]>(
        `/estrutura/controle`,
        {
          params: { partcode: item.getCodigo() },
        },
      );
      const dataSequence = data.map((d) => d.partcode);
      const itens = await this.itemService.consultarItens(
        data.map((d) => d.partcode),
      );
      const itensSequence = dataSequence.map(
        (dado) => itens.find((i) => i.getCodigo() === dado)!,
      );
      return itensSequence;
    } catch (error) {
      throw new Error(
        `Servico de estrutura offline (BUSCAR) ${error.status} ${error.message}`,
      );
    }
  }

  async converter(partcode: string): Promise<Item> {
    try {
      const { data } = await this.client.get<{ partcode: string }[]>(
        `/estrutura/controle`,
        {
          params: { partcode },
        },
      );
      const partcode_resolved = data.at(data.length - 1);
      if (!partcode_resolved)
        throw new InternalServerErrorException(
          'Partcode nao foi resolvido corretamente',
        );
      return await this.itemService.consultarItem(partcode_resolved.partcode);
    } catch (error) {
      throw new Error(
        `Servico de estrutura offline (CONVERSAO) ${error.status} ${error.message}`,
      );
    }
  }
}
