import { PrioridadeData } from "../data/prioridadesData";
import { Prioridade } from "../types/prioridades";
import { PaginatedResponse } from "../dto/paginationDto";
import { PrioridadeFilterDTO } from "../dto/prioridadeFilterDto";
import { FilterUtilsPrioridades } from "../utils/filterUtilsPrioridades";
import { PrioridadeInput } from "../dto/prioridadeDto";


export class PrioridadeBusiness {
    private prioridadeData = new PrioridadeData();

    public async getAllPrioridades(filter: PrioridadeFilterDTO): Promise<PaginatedResponse<Prioridade>> {
        try {
            const completeFilter = FilterUtilsPrioridades.applyDefaults(filter);
            const prioridades = await this.prioridadeData.getAllPrioridades(completeFilter);
            return prioridades;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async getPrioridadeById(id_prioridade: number): Promise<Prioridade | undefined> {
        try {
            const prioridade = await this.prioridadeData.getPrioridadeById(id_prioridade);
            return prioridade;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async createPrioridade(input: PrioridadeInput): Promise<Prioridade> {
        try {
            if (!input.nivel || !input.descricao) {
                throw new Error("Campos obrigatorios ausentes: nivel e descricao.");
            }

            const prioridadeId = await this.prioridadeData.createPrioridade(input);
            return { ...input, id_prioridade: prioridadeId };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async updatePrioridade(
        id_prioridade: number,
        input: PrioridadeInput
    ): Promise<void> {
        try {
            const prioridade = await this.prioridadeData.getPrioridadeById(id_prioridade);
            if (!prioridade) {
                throw new Error("Prioridade nao encontrada.");
            }

            if (!input.nivel || !input.descricao) {
                throw new Error("Campos obrigatorios ausentes: nivel e descricao.");
            }

            await this.prioridadeData.updatePrioridade(id_prioridade, input);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async deletePrioridade(id_prioridade: number): Promise<void> {
        try {
            const prioridade = await this.prioridadeData.getPrioridadeById(id_prioridade);
            if (!prioridade) {
                throw new Error("Prioridade nao encontrada.");
            }

            await this.prioridadeData.deletePrioridade(id_prioridade);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
