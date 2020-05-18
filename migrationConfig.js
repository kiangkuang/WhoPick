require("dotenv").config();

const URL = require("url-parse");
const dbUrl = new URL(process.env.DB_URL);

const config = {
    username: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    host: dbUrl.hostname,
    port: dbUrl.port,
    dialect: "mysql",
};

module.exports = {
    local: config,
    dev: config,
    production: config,
};
