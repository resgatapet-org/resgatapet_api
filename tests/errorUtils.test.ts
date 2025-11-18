import { ErrorUtils } from "../src/utils/ErrorUtils";

describe("Testando ErrorUtils.throwIfHasErrors", () => {

    test("Deve lançar erro quando há erros adicionados", () => {
        expect.assertions(1); 
        
        const errorUtils = new ErrorUtils();
        errorUtils.addError("O nome é obrigatório.");
        errorUtils.addError("A senha não é forte o suficiente.");

        try {
            errorUtils.throwIfHasErrors("Dados de criação inválidos"); 
        } catch (error: any) {
            expect(error.message).toEqual(
                "Dados de criação inválidos: O nome é obrigatório.|A senha não é forte o suficiente."
            );
        }
    });

    test("Não deve lançar erro quando não há erros", () => {
        const errorUtils = new ErrorUtils();
        
        errorUtils.throwIfHasErrors("Dados de criação inválidos");
    });
});
