export default function(sequelize, DataTypes) {
    const question = sequelize.define(
        "question",
        {
            question: DataTypes.STRING(4096),
            userId: DataTypes.INTEGER,
            name: DataTypes.STRING,
            isEnabled: {
                type: DataTypes.BOOLEAN,
                defaultValue: 0
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    question.hasMany(models.option);
                }
            }
        }
    );
    return question;
}
