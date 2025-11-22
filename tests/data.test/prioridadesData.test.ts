import { PrioridadeData } from "../../src/data/prioridadesData";
import mockConnection from "../mocks/dbConnection.mock";

jest.mock("../../src/dbConnection", () => ({
  __esModule: true,
  default: mockConnection
}));

describe("PrioridadeData", () => {

  let prioridadeData: PrioridadeData;

  beforeEach(() => {
    jest.clearAllMocks();
    prioridadeData = new PrioridadeData();
  });

  test("deve retornar prioridades paginadas", async () => {
    mockConnection.select.mockReturnThis();
    mockConnection.where.mockReturnThis();
    mockConnection.count.mockResolvedValue([{ total: 5 }]);
    mockConnection.orderBy.mockReturnThis();
    mockConnection.limit.mockReturnThis();
    mockConnection.offset.mockReturnThis();

    const prioridadesSimuladas = [
      { id_prioridade: 1, descricao: "Alta", nivel: "alta", animal_id: 2 }
    ];

    mockConnection.select.mockResolvedValue(prioridadesSimuladas);

    const result = await prioridadeData.getAllPrioridades({
      nivel: "",
      animal_id: 0,
      page: 1,
      limit: 10,
      sortBy: "id_prioridade",
      sortOrder: "asc"
    });

    expect(result.data).toEqual(prioridadesSimuladas);
    expect(result.pageInfo.total).toBe(5);
    expect(mockConnection.select).toHaveBeenCalled();
  });

  test("deve retornar uma prioridade pelo ID", async () => {
    const prioridadeFake = {
      id_prioridade: 1,
      descricao: "Teste",
      nivel: "baixa",
      animal_id: 3
    };

    mockConnection.where.mockReturnThis();
    mockConnection.first.mockResolvedValue(prioridadeFake);

    const result = await prioridadeData.getPrioridadeById(1);

    expect(result).toEqual(prioridadeFake);
    expect(mockConnection.where).toHaveBeenCalledWith({ id_prioridade: 1 });
  });


  test("deve criar uma prioridade", async () => {
    mockConnection.insert.mockResolvedValue([10]);

    const id = await prioridadeData.createPrioridade({
      descricao: "Nova",
      nivel: "alta",
      animal_id: 2
    });

    expect(id).toBe(10);
    expect(mockConnection.insert).toHaveBeenCalled();
  });

  test("deve atualizar uma prioridade", async () => {
    mockConnection.where.mockReturnThis();
    mockConnection.update.mockResolvedValue(1);

    await prioridadeData.updatePrioridade(1, {
      descricao: "Atualizada",
      nivel: "media",
      animal_id: 5
    });

    expect(mockConnection.where).toHaveBeenCalledWith({ id_prioridade: 1 });
    expect(mockConnection.update).toHaveBeenCalled();
  });

  test("deve deletar uma prioridade", async () => {
    mockConnection.where.mockReturnThis();
    mockConnection.del.mockResolvedValue(1);

    await prioridadeData.deletePrioridade(1);

    expect(mockConnection.where).toHaveBeenCalledWith({ id_prioridade: 1 });
    expect(mockConnection.del).toHaveBeenCalled();
  });

});
