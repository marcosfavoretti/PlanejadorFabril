import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PedidoLogixDTO } from "../../@core/classes/PedidoLogix.dto";
import { addYears, format } from "date-fns";

export class PedidoLogixDAO {
    constructor(
        @InjectDataSource('SYNECO_DB') private dtMainDB: DataSource
    ) { }

    async search(dataCorte: Date): Promise<PedidoLogixDTO[]> {
        const dataBase = format(dataCorte, 'dd/MM/yyyy');
        const dataTeto = format(addYears(dataCorte, 1), 'dd/MM/yyyy');
        const pedidosLogix = await this.dtMainDB.query<PedidoLogixDTO[]>(`
                SELECT 
                    o.identificador,
                    o.codigo,
                    o.item,
                    o.lote,
                    o.dataEntrega,
                    'PENDENTE'
                FROM OPENQUERY(LOGIX64, '
                    SELECT 
                    CASE 
                        WHEN TRIM(COD_ITEM) = ''20-000-00224'' THEN ''20-000-00220''
                        ELSE TRIM(COD_ITEM)
                    END AS "item",
    
                    QTD_PECAS_SOLIC AS "lote",
                    NUM_PEDIDO AS "codigo",
                    PRZ_ENTREGA AS "dataEntrega",
    
                    TO_CHAR(PRZ_ENTREGA, ''DDMMYYYY'') || ''-'' || NUM_PEDIDO AS "identificador"
    
                    FROM PED_ITENS
                    WHERE PRZ_ENTREGA > TO_DATE(''${dataBase}'', ''DD/MM/YYYY'')
                    AND PRZ_ENTREGA < TO_DATE(''${dataTeto}'', ''DD/MM/YYYY'')
                    AND COD_ITEM NOT IN (''20-000-00220'')
                    AND (
                        COD_ITEM LIKE ''20-000-%''
                        OR COD_ITEM LIKE ''17-000-%''
                    )
                
                ') AS o
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM pedido p
                    WHERE p.hash = o.identificador
                ) and o.item IN ('20-000-00398A', '20-000-00220', '20-000-00276E');
            `);
        return pedidosLogix;
    }

}