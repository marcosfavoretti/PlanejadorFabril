SELECT 
                CASE 
                    WHEN COD_ITEM = '20-000-00222' THEN '20-000-00220'
                    ELSE COD_ITEM
                END AS "item",

                QTD_PECAS_SOLIC AS "lote",
                NUM_PEDIDO AS "codigo",
                PRZ_ENTREGA AS "dataEntrega",

                TO_CHAR(PRZ_ENTREGA, 'DD-MM-YYYY') || '-' || NUM_PEDIDO AS "identificador"

            FROM PED_ITENS
            WHERE PRZ_ENTREGA > TO_DATE('01/08/2025', 'DD/MM/YYYY')
            AND COD_ITEM NOT IN ('20-000-00220')
            AND (
                COD_ITEM LIKE '20-000-%'
                OR COD_ITEM LIKE '17-000-%'
            );