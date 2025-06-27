import { CODIGOSETOR } from "../../../planejamento/@core/enum/CodigoSetor.enum";

export class SetoresPalhetaDeCores{
    static colors: Record<CODIGOSETOR, string> = {
        "00017": 'yellow',
        "00011": 'red',
        "00015": 'orange',
        "00025": 'lightgreen',
        "00035": 'lightblue',
        "00050": 'pink',
        "00055": 'darkgray'
    }
}