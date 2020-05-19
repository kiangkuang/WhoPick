const Sequelize = require("sequelize");
const sequelize = require("../sequelize");

const Question = sequelize.define("question", {
  question: Sequelize.STRING(4096),
  userId: Sequelize.INTEGER,
  name: Sequelize.STRING,
  isEnabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: 0,
  },
  isShareAllowed: {
    type: Sequelize.BOOLEAN,
    defaultValue: 0,
  },
});

module.exports = Question;
