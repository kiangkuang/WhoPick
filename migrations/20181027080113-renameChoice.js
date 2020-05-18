"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .renameTable("choices", "options")
            .then(() =>
                queryInterface.renameColumn("options", "choice", "option")
            )
            .then(() =>
                queryInterface.renameColumn("votes", "choiceId", "optionId")
            )
            .then(() =>
                queryInterface.removeIndex("votes", "userId_choiceId_UNIQUE")
            )
            .then(() =>
                queryInterface.addIndex("votes", ["userId", "optionId"], {
                    indexName: "userId_optionId_UNIQUE",
                    indicesType: "UNIQUE",
                })
            );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface
            .renameTable("options", "choices")
            .then(() =>
                queryInterface.renameColumn("choices", "option", "choice")
            )
            .then(() =>
                queryInterface.renameColumn("votes", "optionId", "choiceId")
            )
            .then(() =>
                queryInterface.removeIndex("votes", "userId_optionId_UNIQUE")
            )
            .then(() =>
                queryInterface.addIndex("votes", ["userId", "choiceId"], {
                    indexName: "userId_choiceId_UNIQUE",
                    indicesType: "UNIQUE",
                })
            );
    },
};
