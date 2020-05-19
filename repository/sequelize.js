const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  dialectOptions: {
    charset: "utf8mb4",
  },
  logging: process.env.NODE_ENV !== "production",
});

module.exports = sequelize;
