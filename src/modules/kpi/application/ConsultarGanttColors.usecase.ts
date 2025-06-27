import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { SetoresPalhetaDeCores } from "../@core/classes/GanttColors";

export class ConsultarSetoresPalhetaDeCoresUseCase {
    consultar(): Record<CODIGOSETOR, string> {
        return SetoresPalhetaDeCores.colors;
    }
}