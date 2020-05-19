"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex("votes", ["userId", "choiceId"], {
      indexName: "userId_choiceId_UNIQUE",
      indicesType: "UNIQUE",
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex("votes", "userId_choiceId_UNIQUE");
  },
};
