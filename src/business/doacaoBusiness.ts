import { DoacaoData } from "../data/doacaoData";
import { Doacao } from "../types/doacao";
import { PaginatedResponse } from "../dto/paginationDto";
import { DoacaoFilterDTO } from "../dto/doacaoFilterDto";
import { FilterUtilsDoacao } from "../utils/filterUtilsDoacao";
import { DoacaoInputFromController } from "../dto/doacaoDto";


export class DoacaoBusiness {
    private doacaoData = new DoacaoData();

    public async getAllDoacoes(filter: DoacaoFilterDTO): Promise<PaginatedResponse<Doacao>> {
        try {
            const completeFilter = FilterUtilsDoacao.applyDefaults(filter);
            const doacoes = await this.doacaoData.getAllDoacoes(completeFilter);
            return doacoes;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async getDoacaoById(id_doacao: number): Promise<Doacao | undefined> {
        try {
            const doacao = await this.doacaoData.getDoacaoById(id_doacao);
            return doacao;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async createDoacao(input: DoacaoInputFromController): Promise<Doacao> {
        try {
            const dataDoacao = new Date();

            const doacaoParaDB = {
                tipo: input.tipo,
                ong_id: input.ong_id,
                usuario_id: input.usuario_id,
                valor: input.valor,
                descricao: input.descricao,
                data_doacao: dataDoacao,
            };

            const doacaoId = await this.doacaoData.createDoacao(doacaoParaDB as any);

            return {
                id_doacao: doacaoId,
                ...doacaoParaDB
            } as Doacao;

        } catch (error: any) {
            throw new Error(error.message);
        }
    }

}
