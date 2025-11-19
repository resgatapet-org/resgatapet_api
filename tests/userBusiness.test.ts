import { UserBusiness } from '../src/business/usuarioBusiness';
import { UserData } from '../src/data/usuarioData';
import { AuthUtils } from '../src/utils/authUtils';
import { ErrorUtils } from '../src/utils/ErrorUtils';
import { UsuarioCreateDTO } from '../src/dto/usuarioDto';
import { User } from '../src/types/usuario';

jest.mock('../src/data/usuarioData');
jest.mock('../src/utils/authUtils');
jest.mock('../src/utils/ErrorUtils');

const MOCK_HASHED_PASSWORD = "hashed_password_mock";

const mockInput: UsuarioCreateDTO = {
    nome: "Usuario Teste",
    email: "teste@email.com",
    senha: "senha123",
    tipo: "COMUM",
};

describe("Testando UserBusiness.createUser", () => {
    let userBusiness: UserBusiness;
    let userDataMock: jest.Mocked<UserData>;
    let authUtilsMock: jest.Mocked<typeof AuthUtils>;
    let errorUtilsMock: jest.Mocked<ErrorUtils>;

    beforeEach(() => {
        userBusiness = new UserBusiness();
        userDataMock = (userBusiness as any).userData;
        authUtilsMock = AuthUtils as any;
        // Acessamos a instância mockada de ErrorUtils que é criada dentro do construtor
        errorUtilsMock = (ErrorUtils as jest.Mock).mock.instances[0];

        jest.clearAllMocks();

        userDataMock.getUserByEmail.mockResolvedValue(undefined);
        authUtilsMock.hashPassword.mockResolvedValue(MOCK_HASHED_PASSWORD);
        userDataMock.createUser.mockResolvedValue(5);
    });

    describe("Cenários de Sucesso", () => {
        
        test("Deve criar um usuário com sucesso e retornar o usuário criado", async () => {
            const result = await userBusiness.createUser(mockInput);

            expect(authUtilsMock.hashPassword).toHaveBeenCalledWith(mockInput.senha);
            expect(authUtilsMock.hashPassword).toHaveBeenCalledTimes(1);

            expect(userDataMock.createUser).toHaveBeenCalled();
            expect(userDataMock.createUser).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                id_usuario: 5,
                nome: mockInput.nome,
                email: mockInput.email,
                senha: MOCK_HASHED_PASSWORD,
                tipo: mockInput.tipo,
                data_criacao: expect.any(Date),
            });
        });

        test("Deve verificar email antes de fazer hash da senha", async () => {
            await userBusiness.createUser(mockInput);

            expect(userDataMock.getUserByEmail).toHaveBeenCalledWith(mockInput.email);
            expect(userDataMock.getUserByEmail).toHaveBeenCalledTimes(1);
        });

        test("Deve chamar todos os métodos na ordem correta", async () => {
            await userBusiness.createUser(mockInput);

            expect(userDataMock.getUserByEmail).toHaveBeenCalled();

            expect(authUtilsMock.hashPassword).toHaveBeenCalled();

            expect(userDataMock.createUser).toHaveBeenCalled();

            expect(userDataMock.getUserByEmail).toHaveReturnedTimes(1);
            expect(authUtilsMock.hashPassword).toHaveReturnedTimes(1);
            expect(userDataMock.createUser).toHaveReturnedTimes(1);
        });
    });

    describe("Validação de Email Duplicado", () => {
        
        test("Deve lançar erro quando email já está cadastrado", async () => {
            expect.assertions(2);

            const existingUser: User = {
                id_usuario: 1,
                nome: mockInput.nome,
                email: mockInput.email,
                senha: mockInput.senha,
                tipo: mockInput.tipo,
                data_criacao: new Date(),
            };

            userDataMock.getUserByEmail.mockResolvedValue(existingUser);

            try {
                await userBusiness.createUser(mockInput);
            } catch (error: any) {
                expect(error.message).toEqual("Email já cadastrado.");

                expect(userDataMock.createUser).not.toHaveBeenCalled();
            }
        });

        test("Não deve fazer hash da senha se email já existe", async () => {
            expect.assertions(2);

            const existingUser: User = {
                id_usuario: 1,
                nome: mockInput.nome,
                email: mockInput.email,
                senha: mockInput.senha,
                tipo: mockInput.tipo,
                data_criacao: new Date(),
            };

            userDataMock.getUserByEmail.mockResolvedValue(existingUser);

            try {
                await userBusiness.createUser(mockInput);
            } catch (error: any) {
                expect(error.message).toEqual("Email já cadastrado.");
                expect(authUtilsMock.hashPassword).not.toHaveBeenCalled();
            }
        });
    });

    describe("Validação de Campos Obrigatórios", () => {
        
        test("Deve lançar erro quando faltar o campo 'tipo'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "Usuario Teste",
                email: "teste@email.com",
                senha: "senha123",
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual(
                    "Campos obrigatórios ausentes: nome, email, senha e tipo."
                );
            }
        });

        test("Deve lançar erro quando faltar o campo 'nome'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                email: "teste@email.com",
                senha: "senha123",
                tipo: "COMUM"
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(error.message).toContain("nome");
            }
        });

        test("Deve lançar erro quando faltar o campo 'email'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "Usuario Teste",
                senha: "senha123",
                tipo: "COMUM"
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(error.message).toContain("email");
            }
        });

        test("Deve lançar erro quando faltar o campo 'senha'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "Usuario Teste",
                email: "teste@email.com",
                tipo: "COMUM"
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(error.message).toContain("senha");
            }
        });

        test("Deve lançar erro quando faltarem múltiplos campos", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "Usuario Teste"
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual(
                    "Campos obrigatórios ausentes: nome, email, senha e tipo."
                );
            }
        });

        test("Deve lançar erro quando input for objeto vazio", async () => {
            expect.assertions(1);

            const invalidInput: any = {};

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(error.message).toContain("Campos obrigatórios ausentes");
            }
        });
    });

    describe("Validação de Formato de Dados", () => {
        
        test("Deve lançar erro para nome vazio", async () => {
            expect.assertions(1);

            const invalidInput: UsuarioCreateDTO = {
                ...mockInput,
                nome: ""
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(error.message).toContain("nome");
            }
        });

        test("Deve lançar erro para email inválido", async () => {
            expect.assertions(2);

            const invalidInput: UsuarioCreateDTO = {
                ...mockInput,
                email: "email_invalido"
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(errorUtilsMock.addError).toHaveBeenCalledWith("Formato de email inválido.");
                expect(errorUtilsMock.throwIfHasErrors).toHaveBeenCalled();
            }
        });

        test("Deve lançar erro para senha muito curta", async () => {
            expect.assertions(1);

            const invalidInput: UsuarioCreateDTO = {
                ...mockInput,
                senha: "123"
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(error.message).toContain("senha");
            }
        });

        test("Deve lançar erro para tipo inválido", async () => {
            expect.assertions(2);

            const invalidInput: any = {
                ...mockInput,
                tipo: "TIPO_INVALIDO"
            };

            try {
                await userBusiness.createUser(invalidInput);
            } catch (error: any) {
                expect(errorUtilsMock.addError).toHaveBeenCalledWith("O tipo de usuário deve ser 'ADMIN', 'ONG' ou 'COMUM'.");
                expect(errorUtilsMock.throwIfHasErrors).toHaveBeenCalled();
            }
        });
    });

    describe("Comportamento dos Mocks", () => {
        
        test("Deve usar senha mockada no resultado", async () => {
            const customHash = "custom_hash_123";
            authUtilsMock.hashPassword.mockResolvedValue(customHash);

            const result = await userBusiness.createUser(mockInput);

            expect(result.senha).toBe(customHash);
        });

        test("Deve usar ID mockado no resultado", async () => {
            userDataMock.createUser.mockResolvedValue(999);

            const result = await userBusiness.createUser(mockInput);

            expect(result.id_usuario).toBe(999);
        });

        test("Deve limpar mocks entre testes", async () => {
            await userBusiness.createUser(mockInput);
            
            const firstCallCount = userDataMock.createUser.mock.calls.length;
            jest.clearAllMocks();
            
            await userBusiness.createUser(mockInput);
            
            expect(userDataMock.createUser).toHaveBeenCalledTimes(1);
        });
    });
});