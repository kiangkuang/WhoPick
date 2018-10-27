"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .renameTable("choices", "options")
            .then(function() {
                return queryInterface
                    .renameColumn("options", "choice", "option")
                    .then(function() {
                        return queryInterface
                            .renameColumn("votes", "choiceId", "optionId")
                            .then(function() {
                                return queryInterface
                                    .removeIndex(
                                        "votes",
                                        "userId_choiceId_UNIQUE"
                                    )
                                    .then(function() {
                                        return queryInterface.addIndex(
                                            "votes",
                                            ["userId", "optionId"],
                                            {
                                                indexName:
                                                    "userId_optionId_UNIQUE",
                                                indicesType: "UNIQUE"
                                            }
                                        );
                                    });
                            });
                    });
            });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface
            .renameTable("options", "choices")
            .then(function() {
                return queryInterface
                    .renameColumn("choices", "option", "choice")
                    .then(function() {
                        return queryInterface
                            .renameColumn("votes", "optionId", "choiceId")
                            .then(function() {
                                return queryInterface
                                    .removeIndex(
                                        "votes",
                                        "userId_optionId_UNIQUE"
                                    )
                                    .then(function() {
                                        return queryInterface.addIndex(
                                            "votes",
                                            ["userId", "choiceId"],
                                            {
                                                indexName:
                                                    "userId_choiceId_UNIQUE",
                                                indicesType: "UNIQUE"
                                            }
                                        );
                                    });
                            });
                    });
            });
    }
};
