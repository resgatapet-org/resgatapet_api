import { ErrorUtils } from "../src/utils/ErrorUtils";

describe("Testando ErrorUtils", () => {
    
    describe("throwIfHasErrors", () => {
        
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
            
            expect(() => {
                errorUtils.throwIfHasErrors("Dados de criação inválidos");
            }).not.toThrow();
        });

        test("Deve lançar erro quando há apenas um erro adicionado", () => {
            expect.assertions(1);
            
            const errorUtils = new ErrorUtils();
            errorUtils.addError("O nome é obrigatório.");

            try {
                errorUtils.throwIfHasErrors("Dados inválidos");
            } catch (error: any) {
                expect(error.message).toEqual("Dados inválidos: O nome é obrigatório.");
            }
        });
    });

    describe("addError", () => {
        
        test("Deve adicionar erro à lista de erros", () => {
            const errorUtils = new ErrorUtils();
            
            expect(() => {
                errorUtils.throwIfHasErrors("Teste");
            }).not.toThrow();

            errorUtils.addError("Erro de teste");
            
            expect(() => {
                errorUtils.throwIfHasErrors("Teste");
            }).toThrow();
        });

        test("Deve adicionar múltiplos erros sequencialmente", () => {
            expect.assertions(1);
            
            const errorUtils = new ErrorUtils();
            errorUtils.addError("Erro 1");
            errorUtils.addError("Erro 2");
            errorUtils.addError("Erro 3");

            try {
                errorUtils.throwIfHasErrors("Múltiplos erros");
            } catch (error: any) {
                expect(error.message).toContain("Erro 1");
            }
        });
    });
});