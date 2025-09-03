import { CODIGOSETOR } from "../../../planejamento/@core/enum/CodigoSetor.enum";

export class SetoresPalhetaDeCores{
    static colors: Record<CODIGOSETOR, string> = {
        "00017": 'yellow',
        "00011": 'red',
        "00015": 'orange',
        "00025": 'green',
        "00035": 'blue',
        "00050": 'pink',
        "00020": 'gray'
    }
}