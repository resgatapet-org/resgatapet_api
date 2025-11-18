import connection from '../src/dbConnection';
import { Knex } from 'knex';

describe("Conexão com o banco de dados", () => {

    test("Deve conectar ao banco de dados ", async () => {
        const result = await connection.raw('SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()');
        
        const tables = result.rows; 
        
        expect(tables.length).toBeGreaterThan(0);
    });

    afterAll(async () => {
        await connection.destroy();
    });
});