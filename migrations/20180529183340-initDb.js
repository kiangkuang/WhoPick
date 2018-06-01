"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
            "ALTER SCHEMA DEFAULT CHARACTER SET utf8mb4"
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
            "ALTER SCHEMA DEFAULT CHARACTER SET latin1"
        );
    }
};
