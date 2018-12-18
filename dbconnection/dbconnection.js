const mysql = require('mysql2/promise');

async function getConnection() {
    const connection = await mysql.createConnection(
        {
            host     : 'localhost',
            user     : 'dbadmin',
            password : 'admin',
            database : 'mcsmcc'
        }
    );

    return connection;
}


module.exports = getConnection;