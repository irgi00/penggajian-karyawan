const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/);
if (!dbUrlMatch) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}
const dbUrl = dbUrlMatch[1].trim();

const client = new Client({
    connectionString: dbUrl
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlPath = path.join(__dirname, 'database', '04_POSTGRESQL_DATABASE.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Executing SQL script...');
        await client.query(sql);
        console.log('SQL script executed successfully.');
        
        // Verification
        const resTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log('Tables:', resTables.rows.map(r => r.table_name));

        const resEnums = await client.query(`
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e';
        `);
        console.log('Enums:', resEnums.rows.map(r => r.typname));
        
        const resIndexes = await client.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public';
        `);
        console.log('Indexes Count:', resIndexes.rows.length);

    } catch (e) {
        console.error('Error executing SQL:', e);
    } finally {
        await client.end();
    }
}

run();
