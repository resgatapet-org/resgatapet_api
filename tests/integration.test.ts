import connection from '../src/dbConnection';

describe("Testes de Integração - Banco de Dados", () => {

    describe("Conexão com o Banco", () => {
        test("Deve conectar ao banco de dados com sucesso", async () => {
            const result = await connection.raw('SELECT 1+1 as result');
            
            expect(result.rows).toBeDefined();
            expect(result.rows[0].result).toBe(2);
        });

        test("Deve listar as tabelas do banco de dados", async () => {
            const result = await connection.raw(
                'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()'
            );
            
            const tables = result.rows;
            
            expect(tables).toBeDefined();
            expect(tables.length).toBeGreaterThan(0);
        });

        test("Deve verificar se a tabela de usuários existe", async () => {
            const result = await connection.raw(
                `SELECT table_name FROM information_schema.tables 
                WHERE table_schema = current_schema() 
                AND table_name = 'usuarios'`
            );
            
            expect(result.rows.length).toBeGreaterThan(0);
        });

        test("Deve executar query SELECT sem erros", async () => {
            await expect(
                connection('usuarios').select('*').limit(1)
            ).resolves.toBeDefined();
        });
    });

    describe("Operações CRUD - Usuários", () => {
        const testUser = {
            nome: "Usuario Teste Integração",
            email: `teste_${Date.now()}@email.com`,
            senha: "senha_hash_teste",
            tipo: "COMUM",
            data_criacao: new Date()
        };

        let createdUserId: number;

        test("Deve inserir um novo usuário no banco", async () => {
            const [id] = await connection('usuarios')
                .insert(testUser)
                .returning('id_usuario');

            createdUserId = id.id_usuario;

            expect(createdUserId).toBeDefined();
            expect(typeof createdUserId).toBe('number');
        });

        test("Deve buscar o usuário criado por email", async () => {
            const result = await connection('usuarios')
                .where({ email: testUser.email })
                .first();

            expect(result).toBeDefined();
            expect(result.nome).toBe(testUser.nome);
            expect(result.email).toBe(testUser.email);
        });

        test("Deve buscar o usuário criado por ID", async () => {
            const result = await connection('usuarios')
                .where({ id_usuario: createdUserId })
                .first();

            expect(result).toBeDefined();
            expect(result.id_usuario).toBe(createdUserId);
        });

        test("Deve atualizar os dados do usuário", async () => {
            const novoNome = "Usuario Atualizado";

            await connection('usuarios')
                .where({ id_usuario: createdUserId })
                .update({ nome: novoNome });

            const result = await connection('usuarios')
                .where({ id_usuario: createdUserId })
                .first();

            expect(result.nome).toBe(novoNome);
        });

        test("Deve contar o número de usuários no banco", async () => {
            const result = await connection('usuarios').count('* as total');
            
            const total = parseInt(result[0].total as string);
            
            expect(total).toBeGreaterThan(0);
        });

        test("Deve deletar o usuário de teste", async () => {
            const deletedRows = await connection('usuarios')
                .where({ id_usuario: createdUserId })
                .delete();

            expect(deletedRows).toBe(1);

            const result = await connection('usuarios')
                .where({ id_usuario: createdUserId })
                .first();

            expect(result).toBeUndefined();
        });
    });

    describe("Validações de Integridade", () => {
        test("Não deve permitir inserir usuário com email duplicado", async () => {
            const testUser = {
                nome: "Usuario Duplicado",
                email: "duplicado@email.com",
                senha: "senha_hash",
                tipo: "COMUM",
                data_criacao: new Date()
            };

            await connection('usuarios').insert(testUser);

            await expect(
                connection('usuarios').insert(testUser)
            ).rejects.toThrow();

            await connection('usuarios')
                .where({ email: testUser.email })
                .delete();
        });

        test("Deve respeitar constraint de tipo de usuário", async () => {
            const invalidUser = {
                nome: "Usuario Invalido",
                email: `invalido_${Date.now()}@email.com`,
                senha: "senha_hash",
                tipo: "TIPO_INVALIDO",
                data_criacao: new Date()
            };

            await expect(
                connection('usuarios').insert(invalidUser)
            ).rejects.toThrow();
        });

        test("Não deve permitir campos obrigatórios nulos", async () => {
            const invalidUser = {
                nome: null,
                email: `nulo_${Date.now()}@email.com`,
                senha: "senha_hash",
                tipo: "COMUM"
            };

            await expect(
                connection('usuarios').insert(invalidUser)
            ).rejects.toThrow();
        });
    });

    describe("Performance e Queries", () => {
        test("Deve executar query com filtro de tipo", async () => {
            const result = await connection('usuarios')
                .where({ tipo: 'COMUM' })
                .limit(10);

            expect(Array.isArray(result)).toBe(true);
            result.forEach(user => {
                expect(user.tipo).toBe('COMUM');
            });
        });

        test("Deve ordenar usuários por data de criação", async () => {
            const result = await connection('usuarios')
                .orderBy('data_criacao', 'desc')
                .limit(5);

            expect(Array.isArray(result)).toBe(true);
            
            if (result.length > 1) {
                for (let i = 0; i < result.length - 1; i++) {
                    const currentDate = new Date(result[i].data_criacao);
                    const nextDate = new Date(result[i + 1].data_criacao);
                    expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
                }
            }
        });

        test("Deve buscar usuários com paginação", async () => {
            const page = 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            const result = await connection('usuarios')
                .limit(limit)
                .offset(offset);

            expect(result.length).toBeLessThanOrEqual(limit);
        });
    });

    describe("Transações", () => {
        test("Deve fazer rollback em caso de erro na transação", async () => {
            const testEmail = `transaction_${Date.now()}@email.com`;

            try {
                await connection.transaction(async (trx) => {
                    await trx('usuarios').insert({
                        nome: "Usuario Transacao",
                        email: testEmail,
                        senha: "senha_hash",
                        tipo: "COMUM",
                        data_criacao: new Date()
                    });

                    throw new Error("Erro forçado");
                });
            } catch (error) {
            }

            const result = await connection('usuarios')
                .where({ email: testEmail })
                .first();

            expect(result).toBeUndefined();
        });

        test("Deve fazer commit quando transação for bem-sucedida", async () => {
            const testEmail = `transaction_success_${Date.now()}@email.com`;

            await connection.transaction(async (trx) => {
                await trx('usuarios').insert({
                    nome: "Usuario Transacao Success",
                    email: testEmail,
                    senha: "senha_hash",
                    tipo: "COMUM",
                    data_criacao: new Date()
                });
            });

            const result = await connection('usuarios')
                .where({ email: testEmail })
                .first();

            expect(result).toBeDefined();
            expect(result.email).toBe(testEmail);

            await connection('usuarios')
                .where({ email: testEmail })
                .delete();
        });
    });

    afterAll(async () => {
        await connection('usuarios')
            .where('email', 'like', 'teste_%@email.com')
            .delete();

        await connection.destroy();
    });
});