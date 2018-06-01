"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            "votes",
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: {
                    type: Sequelize.STRING(255),
                    allowNull: true
                },
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                choiceId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: "choices",
                        key: "id"
                    }
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
        return queryInterface.dropTable("votes");
    }
};
