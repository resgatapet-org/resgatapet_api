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

    public async createOcorrencia(input: OcorrenciaInputDTO): Promise<void> {
        try {
            if (!input.descricao || !input.localizacao || !input.foto_url) {
                throw new Error("Campos obrigatórios ausentes: descricao, localizacao e foto_url.");
            }

            // Validação de Usuário Comum, se o ID for fornecido
            if (input.usuario_id) {
                const userExists = await this.userData.getUserById(input.usuario_id);
                if (!userExists || userExists.tipo.toUpperCase() !== "COMUM") {
                    throw new Error("Usuário ID inválido ou não é um Usuário Comum.");
                }
            }

            const statusInicial = "encontrado";

            const ocorrenciaParaDB = {
                descricao: input.descricao,
                localizacao: input.localizacao,
                foto_url: input.foto_url,
                usuario_id: input.usuario_id || undefined,
                status: statusInicial,
                data_registro: new Date(),
                ong_id: undefined,
                animal_id: undefined
            };

            await this.ocorrenciaData.createOcorrencia(ocorrenciaParaDB);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async updateOcorrenciaStatus(id_ocorrencia: number, statusInput: OcorrenciaUpdateStatusDTO, userId?: number, userType?: string): Promise<void> {
        const { status } = statusInput;
        try {
            const ocorrencia = await this.ocorrenciaData.getOcorrenciaById(id_ocorrencia);
            if (!ocorrencia) {
                throw new Error("Ocorrência não encontrada.");
            }

            const statusPermitidos = ["resolvido", "em andamento", "cancelado", "encontrado"];
            if (!statusPermitidos.includes(status)) {
                throw new Error("Status de ocorrência inválido.");
            }

            let ong_id_para_associar: number | undefined;

            // ONG só pode colocar 'em andamento'
            if (status === 'em andamento') {
                if (userType === 'ONG') {
                    const ong = await this.ongData.getOngByUserId(userId!);
                    if (!ong) {
                        throw new Error("Sua conta não está associada a nenhuma ONG cadastrada.");
                    }
                    ong_id_para_associar = ong.id_ong;
                    await this.ocorrenciaData.updateOcorrenciaStatus(id_ocorrencia, status, ong_id_para_associar);
                } else if (userType === 'ADMIN') {
                    await this.ocorrenciaData.updateOcorrenciaStatus(id_ocorrencia, status);
                } else {
                    throw new Error("Apenas uma conta ONG ou ADMIN pode alterar o status para 'em andamento'.");
                }
            } else if (status === 'resolvido' || status === 'cancelado' || status === 'encontrado') {
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