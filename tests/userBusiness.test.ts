import { UserBusiness } from '../src/business/usuarioBusiness';
import { UserData } from '../src/data/usuarioData';
import { AuthUtils } from '../src/utils/authUtils';
import { UsuarioCreateDTO } from '../src/dto/usuarioDto';

jest.mock('../src/data/usuarioData');

jest.mock('../src/utils/authUtils');

const MOCK_HASHED_PASSWORD = "hashed_password_mock";

const mockInput: UsuarioCreateDTO = {
    nome: "Usuario Teste",
    email: "teste@email.com",
    senha: "senha123",
    tipo: "COMUM",
};

describe("Testando a função UserBusiness.createUser", () => {
    let userBusiness: UserBusiness;
    let userDataMock: jest.Mocked<UserData>;
    let authUtilsMock: jest.Mocked<typeof AuthUtils>;

    beforeEach(() => {
        userBusiness = new UserBusiness();
        userDataMock = (userBusiness as any).userData;
        authUtilsMock = AuthUtils as any;

        jest.clearAllMocks();

        userDataMock.getUserByEmail.mockResolvedValue(undefined);
        authUtilsMock.hashPassword.mockResolvedValue(MOCK_HASHED_PASSWORD);
        userDataMock.createUser.mockResolvedValue(5);
    });


    test("Deve criar um usuário com sucesso e retornar o usuário criado", async () => {

        const result = await userBusiness.createUser(mockInput);

        //verifica hash da senha 
        expect(authUtilsMock.hashPassword).toHaveBeenCalledWith(mockInput.senha);

        expect(userDataMock.createUser).toHaveBeenCalled();

        expect(result).toEqual({
            id_usuario: 5,
            nome: mockInput.nome,
            email: mockInput.email,
            senha: MOCK_HASHED_PASSWORD,
            tipo: mockInput.tipo,
            data_criacao: expect.any(Date),
        });
    });

    test("Deve verificar email duplicado e lançar erro", async () => {
        expect.assertions(1);

        userDataMock.getUserByEmail.mockResolvedValue({
            id_usuario: 1,
            ...mockInput,
            data_criacao: new Date(),
        } as any);

        try {
            await userBusiness.createUser(mockInput);
        } catch (error: any) {
            expect(error.message).toEqual("Email já cadastrado.");
        }
    });

    test("Deve retornar 'Campos obrigatórios ausentes...' quando faltar campos", async () => {
        expect.assertions(1);

        const invalidInput: any = {
            nome: "Usuario Teste",
            email: "teste@email.com",
            senha: "senha123",
            // falta o tipo
        };

        try {
            await userBusiness.createUser(invalidInput);
        } catch (error: any) {
            expect(error.message).toEqual("Campos obrigatórios ausentes: nome, email, senha e tipo.");
        }
    });
});