"use strict";
module.exports = function(sequelize, DataTypes) {
    var vote = sequelize.define(
        "vote",
        {
            userId: DataTypes.INTEGER,
            name: DataTypes.STRING
        },
        {
            classMethods: {
                associate: function(models) {
                    // associations can be defined here
                }
            }
        }
    );
    return vote;
};
