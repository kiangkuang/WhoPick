const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const Option = sequelize.define("option", {
  option: Sequelize.STRING(4096),
});

module.exports = Option;
