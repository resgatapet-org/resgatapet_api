import { OcorrenciaData } from "../data/ocorrenciaData";
import { Ocorrencia } from "../types/ocorrencia";
import { PaginatedResponse } from "../dto/paginationDto";
import { OcorrenciaFilterDTO, OcorrenciaInputDTO, OcorrenciaUpdateStatusDTO } from "../dto/ocorrenciaFilterDto";
import { FilterUtilsOcorrencia } from "../utils/filterUtilsOcorrencia";
import { UserData } from "../data/usuarioData";
import { OngData } from "../data/ongData";

export class OcorrenciaBusiness {
    private ocorrenciaData = new OcorrenciaData();
    private userData = new UserData();
    private ongData = new OngData();

    public async getAllOcorrencias(filter: OcorrenciaFilterDTO): Promise<PaginatedResponse<Ocorrencia>> {
        try {
            const completeFilter = FilterUtilsOcorrencia.applyOcorrenciaDefaults(filter);
            const ocorrencias = await this.ocorrenciaData.getAllOcorrencias(completeFilter);
            return ocorrencias;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async getOcorrenciaById(id_ocorrencia: number): Promise<Ocorrencia | undefined> {
        try {
            const ocorrencia = await this.ocorrenciaData.getOcorrenciaById(id_ocorrencia);
            return ocorrencia;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async createOcorrencia(input: OcorrenciaInputDTO): Promise<Ocorrencia> {
        try {
           
            if (!input.descricao || !input.localizacao || !input.foto_url) {
                throw new Error("Campos obrigatórios ausentes: descricao, localizacao e foto_url.");
            }

            if (input.usuario_id) {
                const userExists = await this.userData.getUserById(input.usuario_id);
                if (!userExists) {
                    throw new Error("Usuário não encontrado.");
                }
                if (userExists.tipo.toUpperCase() !== "COMUM") {
                    throw new Error("Apenas usuários do tipo COMUM podem criar ocorrências.");
                }
            }

            const ocorrenciaParaDB = {
                descricao: input.descricao,
                localizacao: input.localizacao,
                foto_url: input.foto_url,
                usuario_id: input.usuario_id || undefined,
                status: "encontrado",
                data_registro: new Date(),
                ong_id: undefined,
                animal_id: undefined
            };

            const ocorrenciaId = await this.ocorrenciaData.createOcorrencia(ocorrenciaParaDB);
            
            return { 
                ...ocorrenciaParaDB, 
                id_ocorrencia: ocorrenciaId 
            } as Ocorrencia;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async updateOcorrenciaStatus(
        id_ocorrencia: number, 
        statusInput: OcorrenciaUpdateStatusDTO, 
        userId?: number, 
        userType?: string
    ): Promise<void> {
        try {
            const { status } = statusInput;

            // Verifica se a ocorrência existe
            const ocorrencia = await this.ocorrenciaData.getOcorrenciaById(id_ocorrencia);
            if (!ocorrencia) {
                throw new Error("Ocorrência não encontrada.");
            }

            // Validação de status permitidos
            const statusPermitidos = ["resolvido", "em andamento", "cancelado", "encontrado"];
            if (!statusPermitidos.includes(status)) {
                throw new Error("Status de ocorrência inválido.");
            }

            // Regras de negócio para status "em andamento"
            if (status === "em andamento") {
                if (userType === "ONG") {
                    const ong = await this.ongData.getOngByUserId(userId!);
                    if (!ong) {
                        throw new Error("Sua conta não está associada a nenhuma ONG cadastrada.");
                    }
                    await this.ocorrenciaData.updateOcorrenciaStatus(id_ocorrencia, status, ong.id_ong);
                } else if (userType === "ADMIN") {
                    await this.ocorrenciaData.updateOcorrenciaStatus(id_ocorrencia, status);
                } else {
                    throw new Error("Apenas uma conta ONG ou ADMIN pode alterar o status para 'em andamento'.");
                }
            } else {
                // Para outros status (resolvido, cancelado, encontrado)
                await this.ocorrenciaData.updateOcorrenciaStatus(id_ocorrencia, status);
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async deleteOcorrencia(id_ocorrencia: number): Promise<void> {
        try {
            const ocorrencia = await this.ocorrenciaData.getOcorrenciaById(id_ocorrencia);
            if (!ocorrencia) {
                throw new Error("Ocorrência não encontrada.");
            }

            await this.ocorrenciaData.deleteOcorrencia(id_ocorrencia);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}