module.exports = function (sequelize, DataTypes) {
    const option = sequelize.define(
        "option",
        {
            option: DataTypes.STRING(4096),
            questionId: DataTypes.INTEGER,
        },
        {
            classMethods: {
                associate: function (models) {
                    option.belongsTo(models.question);
                    option.hasMany(models.vote);
                },
            },
        }
    );
    return option;
};
