import { DoacaoBusiness } from '../src/business/doacaoBusiness';
import { DoacaoData } from '../src/data/doacaoData';
import { FilterUtilsDoacao } from '../src/utils/filterUtilsDoacao';
import { DoacaoInputFromController } from '../src/dto/doacaoDto';
import { Doacao } from '../src/types/doacao';

jest.mock('../src/data/doacaoData');
jest.mock('../src/utils/filterUtilsDoacao');

const MOCK_DATE = new Date("2025-01-01T10:00:00Z");

const mockInput: DoacaoInputFromController = {
    tipo: "PIX",
    ong_id: 10,
    usuario_id: 20,
    valor: 50,
    descricao: "Doação de teste"
};

describe("Testando DoacaoBusiness (Ajustado para o TYPE REAL)", () => {
    let doacaoBusiness: DoacaoBusiness;
    let doacaoDataMock: jest.Mocked<DoacaoData>;

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(MOCK_DATE);

        doacaoBusiness = new DoacaoBusiness();
        doacaoDataMock = (doacaoBusiness as any).doacaoData;

        jest.clearAllMocks();

        doacaoDataMock.createDoacao.mockResolvedValue(5);
        FilterUtilsDoacao.applyDefaults = jest.fn().mockReturnValue(mockInput);
    });

    describe("Cenários de Sucesso", () => {
        test("Deve criar uma doação corretamente com base no type real", async () => {
            const result = await doacaoBusiness.createDoacao(mockInput);

            expect(doacaoDataMock.createDoacao).toHaveBeenCalledTimes(1);
            expect(doacaoDataMock.createDoacao).toHaveBeenCalledWith({
                tipo: mockInput.tipo,
                ong_id: mockInput.ong_id,
                usuario_id: mockInput.usuario_id,
                valor: mockInput.valor,
                descricao: mockInput.descricao,
                data_doacao: MOCK_DATE
            });

            expect(result).toEqual({
                id_doacao: 5,
                tipo: "PIX",
                ong_id: 10,
                usuario_id: 20,
                valor: 50,
                descricao: "Doação de teste",
                data_doacao: MOCK_DATE
            });
        });

        test("Deve permitir valor e descricao ausentes, já que são opcionais no TYPE", async () => {
            const inputSemOpcionais: DoacaoInputFromController = {
                tipo: "PIX",
                ong_id: 10,
                usuario_id: 20
            };

            doacaoDataMock.createDoacao.mockResolvedValue(99);

            const result = await doacaoBusiness.createDoacao(inputSemOpcionais);

            expect(result).toEqual({
                id_doacao: 99,
                tipo: "PIX",
                ong_id: 10,
                usuario_id: 20,
                data_doacao: MOCK_DATE
            });
        });
    });

    describe("Validações", () => {
        test("Deve lançar erro se faltar tipo", async () => {
            expect.assertions(1);

            const invalid: any = { ...mockInput, tipo: undefined };

            try {
                await doacaoBusiness.createDoacao(invalid);
            } catch (error: any) {
                expect(error.message).toContain("tipo");
            }
        });

        test("Deve lançar erro se faltar ong_id", async () => {
            expect.assertions(1);

            const invalid: any = { ...mockInput, ong_id: undefined };

            try {
                await doacaoBusiness.createDoacao(invalid);
            } catch (error: any) {
                expect(error.message).toContain("ong_id");
            }
        });

        test("Deve lançar erro se faltar usuario_id", async () => {
            expect.assertions(1);

            const invalid: any = { ...mockInput, usuario_id: undefined };

            try {
                await doacaoBusiness.createDoacao(invalid);
            } catch (error: any) {
                expect(error.message).toContain("usuario_id");
            }
        });

        test("Se 'valor' for enviado, deve ser maior que 0", async () => {
            expect.assertions(1);

            const invalid: any = { ...mockInput, valor: 0 };

            try {
                await doacaoBusiness.createDoacao(invalid);
            } catch (error: any) {
                expect(error.message).toContain("valor");
            }
        });
    });

    describe("getAllDoacoes", () => {
        const mockResult = {
            data: [],
            total: 0,
            page: 1,
            pageSize: 10
        };

        test("Deve aplicar filtros e buscar no banco", async () => {
            doacaoDataMock.getAllDoacoes.mockResolvedValue(mockResult);

            const result = await doacaoBusiness.getAllDoacoes({
                page: 1,
                pageSize: 10
            } as any);

            expect(FilterUtilsDoacao.applyDefaults).toHaveBeenCalled();
            expect(doacaoDataMock.getAllDoacoes).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockResult);
        });
    });

    describe("getDoacaoById", () => {
        test("Deve retornar uma doação válida", async () => {
            const mockDoacao: Doacao = {
                id_doacao: 10,
                tipo: "CARTAO",
                ong_id: 1,
                usuario_id: 2,
                data_doacao: MOCK_DATE
            };

            doacaoDataMock.getDoacaoById.mockResolvedValue(mockDoacao);

            const result = await doacaoBusiness.getDoacaoById(10);

            expect(result).toEqual(mockDoacao);
        });

        test("Deve retornar undefined se não encontrar", async () => {
            doacaoDataMock.getDoacaoById.mockResolvedValue(undefined);

            const result = await doacaoBusiness.getDoacaoById(999);

            expect(result).toBeUndefined();
        });
    });

    describe("Mocks", () => {
        test("Deve usar ID retornado pelo mock", async () => {
            doacaoDataMock.createDoacao.mockResolvedValue(777);

            const result = await doacaoBusiness.createDoacao(mockInput);

            expect(result.id_doacao).toBe(777);
        });

        test("Deve resetar os mocks entre testes", async () => {
            await doacaoBusiness.createDoacao(mockInput);

            expect(doacaoDataMock.createDoacao).toHaveBeenCalledTimes(1);

            jest.clearAllMocks();
            doacaoDataMock.createDoacao.mockResolvedValue(1);

            await doacaoBusiness.createDoacao(mockInput);

            expect(doacaoDataMock.createDoacao).toHaveBeenCalledTimes(1);
        });
    });
});
