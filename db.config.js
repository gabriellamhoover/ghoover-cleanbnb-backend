
const Pool = require('pg').Pool
var connectionParams = null;
if(process.env.DATABASE_URL != null) {
	connectionParams = {
		connectionString: process.env.DATABASE_URL, 
		ssl: {rejectUnauthorized: false }
	}
} else {
	connectionParams = {
		user: 'api_user',
		host: 'localhost',
		database: 'api',
		password: 'password',
		port: 5432
	}
}
const pool = new Pool(connectionParams)

module.exports = pool;
