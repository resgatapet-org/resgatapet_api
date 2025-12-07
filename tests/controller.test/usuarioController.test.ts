import { UserController } from "../../src/controller/usuarioController";
import { UserBusiness } from "../../src/business/usuarioBusiness";
import { PaginatedResponse } from "../../src/dto/paginationDto";
import { User } from "../../src/types/usuario";

jest.mock("../../src/business/usuarioBusiness");

const UserBusinessMock = UserBusiness as jest.MockedClass<typeof UserBusiness>;

const mockUser: User = {
    id_usuario: 1,
    nome: "Teste",
    email: "teste@mail.com",
    senha: "hash_senha",
    tipo: "COMUM",
    data_criacao: new Date(),
};

const mockPaginatedResponse: PaginatedResponse<User> = {
    data: [mockUser],
    pageInfo: {
        total: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
    },
};

describe("UserController", () => {
    let userController: UserController;
    
    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        userController = new UserController();
    });

    describe("GET /usuarios (getAll)", () => {
        test("Deve retornar 200 e a lista paginada de usuarios", async () => {
            UserBusinessMock.prototype.getAllUsers.mockResolvedValue(mockPaginatedResponse);
            await userController.getAll(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith(mockPaginatedResponse);
        });

        test("Deve retornar 500 em caso de falha interna do Business", async () => {
            const errorMessage = "Erro no banco de dados";
            UserBusinessMock.prototype.getAllUsers.mockRejectedValue(new Error(errorMessage));

            await userController.getAll(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({ error: errorMessage });
        });
    });
    
    describe("GET /usuarios/:id (getById)", () => {
        test("Deve retornar 200 e o usuario se o ID for valido", async () => {
            UserBusinessMock.prototype.getUserById.mockResolvedValue(mockUser);
            mockRequest.params = { id: "1" }; 

            await userController.getById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
        });

        test("Deve retornar 404 se o usuario nao for encontrado", async () => {
            UserBusinessMock.prototype.getUserById.mockResolvedValue(undefined);
            mockRequest.params = { id: "999" };

            await userController.getById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Usuário não encontrado" });
        });
    });

    describe("POST /usuarios (create)", () => {
        const createInput = {
            nome: "Novo User",
            email: "novo@teste.com",
            senha: "senhaforte",
            tipo: "COMUM",
        };

        test("Deve retornar 201 Created e o usuario criado em caso de sucesso", async () => {
            UserBusinessMock.prototype.createUser.mockResolvedValue({ ...mockUser, id_usuario: 2 } as any);
            mockRequest.body = createInput;

            await userController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });

        test("Deve retornar 409 Conflict se o email ja estiver cadastrado", async () => {
            const errorMessage = "Email já cadastrado.";
            UserBusinessMock.prototype.createUser.mockRejectedValue(new Error(errorMessage));
            mockRequest.body = createInput;

            await userController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
        });

        test("Deve retornar 400 Bad Request se a senha for muito curta", async () => {
            mockRequest.body = { ...createInput, senha: "123" }; 

            await userController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    errors: ["A senha deve ter no minimo 6 caracteres."],
                })
            );
        });
    });

    describe("DELETE /usuarios/:id", () => {
        test("Deve retornar 204 No Content se o usuario for deletado com sucesso", async () => {
            UserBusinessMock.prototype.deleteUser.mockResolvedValue();
            mockRequest.params = { id: "5" };

            await userController.delete(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled(); 
        });
        
        test("Deve retornar 403 Forbidden se tentar deletar um ADMIN (regra de Business)", async () => {
            const errorMessage = "A exclusão de um usuário Administrador nao e permitida.";
            UserBusinessMock.prototype.deleteUser.mockRejectedValue(new Error(errorMessage));
            mockRequest.params = { id: "1" };

            await userController.delete(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
        });
    });
});