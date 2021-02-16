import { Association, BelongsToGetAssociationMixin, DataTypes, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin, Model, Optional } from "sequelize";
import { Question } from "./Question";
import { Vote } from "./Vote";
import sequelize from "../sequelize";

export interface OptionAttributes {
    id: number;
    option: string;
    questionId: number;
}

export interface OptionCreationAttributes extends Optional<OptionAttributes, "id"> { }

export class Option extends Model<OptionAttributes, OptionCreationAttributes>
    implements OptionAttributes {
    public id!: number;
    public option!: string;
    public questionId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getQuestion!: BelongsToGetAssociationMixin<Question>;
    public getVotes!: HasManyGetAssociationsMixin<Vote>;
    public createVote!: HasManyCreateAssociationMixin<Vote>;

    public readonly votes?: Vote[];

    public static associations: {
        votes: Association<Option, Vote>;
    };
}

Option.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        option: {
            type: DataTypes.STRING(4096),
            allowNull: true
        },
        questionId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    },
    {
        sequelize,
        tableName: "options",
    }
);

Option.hasMany(Vote, { as: "votes", foreignKey: "optionId" });
