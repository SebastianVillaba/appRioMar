import { executeRequest } from "../utils/dbHandler";

export const getFacturaActual = async (idConfig: number): Promise<any> => {
    try{
        const idFactura = await executeRequest({
            query: "select idFactura from configpc where idConfig="+idConfig,
            isStoredProcedure: false
        })
        const result = await executeRequest({
            query: `select * from [dbo].[funNroFacturaActual] (${idFactura.recordset[0].idFactura})`,
            isStoredProcedure: false
        })
        console.log(result.recordset[0]);
        return result.recordset[0];
    } catch (error:any) {
        console.error("Error en login:", error);
    }
};