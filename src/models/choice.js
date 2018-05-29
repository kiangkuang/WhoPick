export default function(sequelize, DataTypes) {
    const choice = sequelize.define(
        "choice",
        {
            choice: DataTypes.STRING(4096),
            questionId: DataTypes.INTEGER
        },
        {
            classMethods: {
                associate: function(models) {
                    choice.belongsTo(models.question);
                    choice.hasMany(models.vote);
                }
            }
        }
    );
    return choice;
}
