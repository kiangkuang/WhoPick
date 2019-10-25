"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            "questions",
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                question: {
                    type: Sequelize.STRING(4096),
                    allowNull: true
                },
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                name: {
                    type: Sequelize.STRING(255),
                    allowNull: true
                },
                isEnabled: {
                    type: Sequelize.BOOLEAN,
                    allowNull: true,
                    defaultValue: 0
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                charset: "utf8mb4"
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable("questions");
    }
};
