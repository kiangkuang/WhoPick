require("dotenv").config();

const URL = require("url-parse");
const dbUrl = new URL(process.env.DB_URL);

const username = dbUrl.username;
const password = dbUrl.password;
const database = dbUrl.pathname.slice(1);
const host = dbUrl.hostname;
const port = dbUrl.port;

module.exports = {
    local: {
        username: username,
        password: password,
        database: database,
        host: host,
        port: port,
        dialect: "mysql"
    },
    dev: {
        username: username,
        password: password,
        database: database,
        host: host,
        port: port,
        dialect: "mysql"
    },
    production: {
        username: username,
        password: password,
        database: database,
        host: host,
        port: port,
        dialect: "mysql"
    }
};
