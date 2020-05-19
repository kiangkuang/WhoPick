const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const Vote = sequelize.define("vote", {
  name: Sequelize.STRING,
  userId: {
    type: Sequelize.INTEGER,
    unique: "userId_optionId_UNIQUE",
  },
});

module.exports = Vote;
