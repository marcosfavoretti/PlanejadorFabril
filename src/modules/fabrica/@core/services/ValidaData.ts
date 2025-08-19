import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { PlanejamentoTemporario } from "src/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Fabrica } from "../entities/Fabrica.entity";
import { IValidaPlanejamento } from "../interfaces/IValidaPlanejamento";
import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { ErroDeValidacao } from "../exception/ErroDeValidacao.exception";

export class ValidaData implements IValidaPlanejamento {

    private calendario = new Calendario();

    /**
     * @param fabrica 
     * @param pedido 
     * @param planejamentosTemp 
     * @description 
     * O planejamentos nunca pode alocar itens pro dia atual, sempre para dias na frente
     */
    valide(fabrica: Fabrica, pedido: Pedido, planejamentosTemp: PlanejamentoTemporario[]): void {
        const [primeiraData] = planejamentosTemp.sort((a, b) => a.dia.getTime() - b.dia.getTime());
        if(!primeiraData) return;
        if (this.calendario.proximoDiaUtil(this.calendario.inicioDoDia(new Date()), false).getTime() > primeiraData.dia.getTime()) {
            throw new ErroDeValidacao('Data do planejamento não pode ser anterior ao dia atual');
        }
    }
}