"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(
            "choices",
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                choice: {
                    type: Sequelize.STRING(4096),
                    allowNull: true,
                },
                questionId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: "questions",
                        key: "id",
                    },
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
            },
            {
                charset: "utf8mb4",
            }
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable("choices");
    },
};
