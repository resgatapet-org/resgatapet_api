import { AnimalBusiness } from '../src/business/animalBusiness';
import { AnimalData } from '../src/data/animalData';
import { PrioridadeBusiness } from '../src/business/prioridadesBusiness';
import { FilterUtilsAnimal } from '../src/utils/filterUtilsAnimal';
import { AnimalFilterDTO } from '../src/dto/animalFilterDto';
import { PaginatedResponse } from '../src/dto/paginationDto';
import { Animal } from '../src/types/animal';

jest.mock('../src/data/animalData');
jest.mock('../src/business/prioridadesBusiness');
jest.mock('../src/utils/filterUtilsAnimal');

const mockDataRegistro = new Date('2025-11-18T10:00:00.000Z');

const mockAnimalInput: Omit<Animal, "id_animal" | "data_registro"> = {
    nome: "Rex",
    especie: "Cachorro",
    descricao: "Cachorro dócil e brincalhao",
    status: "disponivel",
    localizacao: "Abrigo Feliz - Setor A",
    ong_id: 5,
};

const mockAnimal: Animal = {
    id_animal: 1,
    nome: mockAnimalInput.nome,
    especie: mockAnimalInput.especie,
    descricao: mockAnimalInput.descricao,
    status: mockAnimalInput.status,
    localizacao: mockAnimalInput.localizacao,
    ong_id: mockAnimalInput.ong_id,
    data_registro: mockDataRegistro,
};

describe("Testando a classe AnimalBusiness", () => {
    let animalBusiness: AnimalBusiness;
    let animalDataMock: jest.Mocked<AnimalData>;
    let prioridadeBusinessMock: jest.Mocked<PrioridadeBusiness>;
    let filterUtilsMock: jest.Mocked<typeof FilterUtilsAnimal>;

    beforeEach(() => {
        animalBusiness = new AnimalBusiness();
        animalDataMock = (animalBusiness as any).animalData;
        prioridadeBusinessMock = (animalBusiness as any).prioridadeBusiness;
        filterUtilsMock = FilterUtilsAnimal as any;

        jest.clearAllMocks();
    });

    describe("Testando getAllAnimals", () => {
        test("Deve retornar lista de animais com filtros aplicados", async () => {
            const mockFilter: AnimalFilterDTO = { page: 1, limit: 10 };
            const mockCompleteFilter = { 
                ...mockFilter, 
                especie: "", 
                status: "", 
                ong_id: 0, 
                sortBy: 'id_animal', 
                sortOrder: 'desc' 
            };
            
            const mockResponse: PaginatedResponse<Animal> = {
                data: [mockAnimal],
                pageInfo: {
                    total: 1,
                    limit: 10,
                    page: 1,
                    totalPages: 1,
                },
            };

            filterUtilsMock.applyAnimalDefaults.mockReturnValue(mockCompleteFilter as any);
            animalDataMock.getAllAnimals.mockResolvedValue(mockResponse);

            const result = await animalBusiness.getAllAnimals(mockFilter);

            expect(result).toEqual(mockResponse);
            expect(filterUtilsMock.applyAnimalDefaults).toHaveBeenCalledWith(mockFilter);
            expect(animalDataMock.getAllAnimals).toHaveBeenCalledWith(mockCompleteFilter);
        });

        test("Deve lançar erro quando a camada de dados falhar", async () => {
            expect.assertions(1);
            animalDataMock.getAllAnimals.mockRejectedValue(new Error("Erro no banco de dados"));
            
            try {
                await animalBusiness.getAllAnimals({});
            } catch (error: any) {
                expect(error.message).toEqual("Erro no banco de dados");
            }
        });
    });

    describe("Testando getAnimalById", () => {
        test("Deve retornar um animal pelo ID", async () => {
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal);

            const result = await animalBusiness.getAnimalById(1);

            expect(result).toEqual(mockAnimal);
            expect(animalDataMock.getAnimalById).toHaveBeenCalledWith(1);
        });

        test("Deve retornar undefined quando animal não existir", async () => {
            animalDataMock.getAnimalById.mockResolvedValue(undefined);

            const result = await animalBusiness.getAnimalById(999);

            expect(result).toBeUndefined();
        });

        test("Deve lançar erro quando a camada de dados falhar", async () => {
            expect.assertions(1);
            animalDataMock.getAnimalById.mockRejectedValue(new Error("Erro no banco de dados"));
            
            try {
                await animalBusiness.getAnimalById(1);
            } catch (error: any) {
                expect(error.message).toEqual("Erro no banco de dados");
            }
        });
    });

    describe("Testando createAnimal", () => {
        beforeEach(() => {
            (animalDataMock.createAnimal as jest.Mock).mockResolvedValue(1);
        });

        test("Deve criar um animal com sucesso", async () => {
            const result = await animalBusiness.createAnimal(mockAnimalInput);
            
            expect(animalDataMock.createAnimal).toHaveBeenCalledWith(expect.objectContaining({
                nome: mockAnimalInput.nome,
                especie: mockAnimalInput.especie,
                status: mockAnimalInput.status,
                ong_id: mockAnimalInput.ong_id,
                data_registro: expect.any(Date),
            }));
            
            expect(result).toEqual(expect.objectContaining({
                id_animal: 1,
                nome: mockAnimalInput.nome,
                especie: mockAnimalInput.especie,
                status: mockAnimalInput.status,
            }));
        });

        test("Deve lançar erro se campo 'nome' estiver ausente", async () => {
            expect.assertions(1);
            const invalidInput: any = { 
                especie: "Cachorro", 
                status: "disponivel", 
                ong_id: 5 
            };
            
            try {
                await animalBusiness.createAnimal(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatórios ausentes: nome, especie, status, ong_id.");
            }
        });

        test("Deve lançar erro se campo 'especie' estiver ausente", async () => {
            expect.assertions(1);
            const invalidInput: any = { 
                nome: "Rex", 
                status: "disponivel", 
                ong_id: 5 
            };
            
            try {
                await animalBusiness.createAnimal(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatórios ausentes: nome, especie, status, ong_id.");
            }
        });

        test("Deve lançar erro se campo 'status' estiver ausente", async () => {
            expect.assertions(1);
            const invalidInput: any = { 
                nome: "Rex", 
                especie: "Cachorro", 
                ong_id: 5 
            };
            
            try {
                await animalBusiness.createAnimal(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatórios ausentes: nome, especie, status, ong_id.");
            }
        });

        test("Deve lançar erro se campo 'ong_id' estiver ausente", async () => {
            expect.assertions(1);
            const invalidInput: any = { 
                nome: "Rex", 
                especie: "Cachorro", 
                status: "disponivel" 
            };
            
            try {
                await animalBusiness.createAnimal(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatórios ausentes: nome, especie, status, ong_id.");
            }
        });
    });

    describe("Testando updateAnimal", () => {
        test("Deve atualizar um animal com sucesso", async () => {
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal);
            animalDataMock.updateAnimal.mockResolvedValue();

            const updateData: Partial<Animal> = { 
                nome: "Rex Atualizado", 
                descricao: "Nova descrição" 
            };

            await animalBusiness.updateAnimal(1, updateData);

            expect(animalDataMock.getAnimalById).toHaveBeenCalledWith(1);
            expect(animalDataMock.updateAnimal).toHaveBeenCalledWith(1, updateData);
        });

        test("Deve lançar erro quando animal não existir", async () => {
            expect.assertions(1);
            animalDataMock.getAnimalById.mockResolvedValue(undefined);

            try {
                await animalBusiness.updateAnimal(999, { nome: "Teste" });
            } catch (error: any) {
                expect(error.message).toEqual("Animal não encontrado.");
            }
        });

        test("Deve lançar erro quando a camada de dados falhar", async () => {
            expect.assertions(1);
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal);
            animalDataMock.updateAnimal.mockRejectedValue(new Error("Erro no banco de dados"));

            try {
                await animalBusiness.updateAnimal(1, { nome: "Teste" });
            } catch (error: any) {
                expect(error.message).toEqual("Erro no banco de dados");
            }
        });
    });

    describe("Testando deleteAnimal", () => {
        test("Deve deletar um animal com sucesso", async () => {
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal);
            animalDataMock.deleteAnimal.mockResolvedValue();

            await animalBusiness.deleteAnimal(1);

            expect(animalDataMock.getAnimalById).toHaveBeenCalledWith(1);
            expect(animalDataMock.deleteAnimal).toHaveBeenCalledWith(1);
        });

        test("Deve lançar erro quando animal não existir", async () => {
            expect.assertions(1);
            animalDataMock.getAnimalById.mockResolvedValue(undefined);

            try {
                await animalBusiness.deleteAnimal(999);
            } catch (error: any) {
                expect(error.message).toEqual("Animal não encontrado.");
            }
        });

        test("Deve lançar erro quando a camada de dados falhar", async () => {
            expect.assertions(1);
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal);
            animalDataMock.deleteAnimal.mockRejectedValue(new Error("Erro no banco de dados"));

            try {
                await animalBusiness.deleteAnimal(1);
            } catch (error: any) {
                expect(error.message).toEqual("Erro no banco de dados");
            }
        });
    });

    describe("Testando setPrioridade", () => {
        test("Deve definir prioridade para um animal com sucesso", async () => {
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal);
            prioridadeBusinessMock.createPrioridade.mockResolvedValue(undefined as any);

            await animalBusiness.setPrioridade(1, "alta", "Animal precisa de cuidados urgentes");

            expect(animalDataMock.getAnimalById).toHaveBeenCalledWith(1);
            expect(prioridadeBusinessMock.createPrioridade).toHaveBeenCalledWith({
                animal_id: 1,
                nivel: "alta",
                descricao: "Animal precisa de cuidados urgentes"
            });
        });

        test("Deve lançar erro quando animal não existir", async () => {
            expect.assertions(1);
            animalDataMock.getAnimalById.mockResolvedValue(undefined);

            try {
                await animalBusiness.setPrioridade(999, "alta", "Descrição");
            } catch (error: any) {
                expect(error.message).toEqual("Animal não encontrado.");
            }
        });

        test("Deve lançar erro quando criação de prioridade falhar", async () => {
            expect.assertions(1);
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal);
            prioridadeBusinessMock.createPrioridade.mockRejectedValue(new Error("Erro ao criar prioridade"));

            try {
                await animalBusiness.setPrioridade(1, "alta", "Descrição");
            } catch (error: any) {
                expect(error.message).toEqual("Erro ao criar prioridade");
            }
        });
    });
});