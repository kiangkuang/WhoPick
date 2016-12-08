'use strict';
module.exports = function(sequelize, DataTypes) {
    var choice = sequelize.define('choice', {
        choice: DataTypes.STRING(4096)
    }, {
        classMethods: {
            associate: function(models) {
                choice.hasMany(models.vote);
            }
        }
    });
    return choice;
};
