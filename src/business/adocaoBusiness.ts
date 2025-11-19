import { AdocaoData } from "../data/adocaoData";
import { PaginatedResponse } from "../dto/paginationDto";
import { AdocaoFilterDTO } from "../dto/adocaoFilterDto";
import { FilterUtilsAdocao } from "../utils/filterUtilsAdocao";
import { AnimalData } from "../data/animalData";
import { UserData } from "../data/usuarioData";
import { AdocaoInputFromController } from "../dto/adocaoDto";
import { Adocao } from "../types/adocao";

export class AdocaoBusiness {
  private adocaoData = new AdocaoData();
  private animalData = new AnimalData();
  private userData = new UserData();

  public async getAllAdocoes(filter: AdocaoFilterDTO): Promise<PaginatedResponse<Adocao>> {
    try {
      const completeFilter = FilterUtilsAdocao.applyDefaults(filter);
      const adocoes = await this.adocaoData.getAllAdocoes(completeFilter);
      return adocoes;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async getAdocaoById(id_adocao: number): Promise<Adocao | undefined> {
    try {
      const adocao = await this.adocaoData.getAdocaoById(id_adocao);
      return adocao;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async createAdocao(input: AdocaoInputFromController): Promise<void> {
    try {
      const { animal_id, usuario_id, status } = input;

      if (!animal_id || !usuario_id || !status) {
        throw new Error(
          "Campos obrigatorios ausentes (animal_id, usuario_id, status)."
        );
      }

      const animalExiste = await this.animalData.getAnimalById(animal_id);
      if (!animalExiste) {
        throw new Error(`Animal com ID ${animal_id} nao encontrado.`);
      }

      const usuarioExiste = await this.userData.getUserById(usuario_id);
      if (!usuarioExiste || usuarioExiste.tipo.toUpperCase() !== "COMUM") {
        throw new Error(
          `Usuario com ID ${usuario_id} nao encontrado ou nao e um Usuario Comum.`
        );
      }

      const novaAdocaoParaDB = {
        animal_id: animal_id,
        usuario_id: usuario_id,
        status: status,
        data_solicitacao: new Date(),
        ong_id: animalExiste.ong_id,
      };

      await this.adocaoData.createAdocao(novaAdocaoParaDB);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async updateAdocaoStatus(id_adocao: number, status: string): Promise<void> {
    try {
      const adocao = await this.adocaoData.getAdocaoById(id_adocao);
      if (!adocao) {
        throw new Error("Solicitacao de adocao nao encontrada.");
      }

      const statusPermitidos = ["aprovado", "rejeitado", "em analise"];
      if (!statusPermitidos.includes(status)) {
        throw new Error("Status de adocao invalido.");
      }

      await this.adocaoData.updateAdocaoStatus(id_adocao, status);

      if (status === 'aprovado' && adocao.animal_id) {
        const animal = await this.animalData.getAnimalById(adocao.animal_id);

        if (!animal) {
          console.warn(`Animal com ID ${adocao.animal_id} referenciado na adocao ${id_adocao} nao encontrado na tabela Animal.`);
        } else if (animal.status !== 'adotado') {
          await this.animalData.updateAnimal(adocao.animal_id, { status: 'adotado' });
        }
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async deleteAdocao(id_adocao: number): Promise<void> {
    try {
      const adocao = await this.adocaoData.getAdocaoById(id_adocao);
      if (!adocao) {
        throw new Error("Solicitacao de adocao nao encontrada.");
      }

      await this.adocaoData.deleteAdocao(id_adocao);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
