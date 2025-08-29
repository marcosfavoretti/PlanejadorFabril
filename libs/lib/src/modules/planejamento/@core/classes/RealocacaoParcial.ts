import { Planejamento } from "../entities/Planejamento.entity";
import { PlanejamentoTemporario } from "./PlanejamentoTemporario";

export class RealocacaoParcial{
    retirado: PlanejamentoTemporario[];// passar para o gerenciar marcar como deletado
    adicionado: PlanejamentoTemporario[];
    constructor(){
        this.retirado = [];
        this.adicionado = [];
    }
}