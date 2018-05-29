export default function(sequelize, DataTypes) {
    const vote = sequelize.define(
        "vote",
        {
            name: DataTypes.STRING,
            userId: {
                type: DataTypes.INTEGER,
                unique: "userId_choiceId_UNIQUE"
            },
            choiceId: {
                type: DataTypes.INTEGER,
                unique: "userId_choiceId_UNIQUE"
            }
        },
        {
            classMethods: {
                associate: function(models) {
                    vote.belongsTo(models.choice);
                }
            }
        }
    );
    return vote;
}
