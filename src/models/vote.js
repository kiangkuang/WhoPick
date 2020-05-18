module.exports = function(sequelize, DataTypes) {
    const vote = sequelize.define(
        "vote",
        {
            name: DataTypes.STRING,
            userId: {
                type: DataTypes.INTEGER,
                unique: "userId_optionId_UNIQUE"
            },
            optionId: {
                type: DataTypes.INTEGER,
                unique: "userId_optionId_UNIQUE"
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    vote.belongsTo(models.option);
                }
            }
        }
    );
    return vote;
};
