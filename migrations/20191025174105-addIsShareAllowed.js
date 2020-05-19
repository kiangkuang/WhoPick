"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("questions", "isShareAllowed", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      after: "isEnabled",
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("questions", "isShareAllowed");
  },
};
