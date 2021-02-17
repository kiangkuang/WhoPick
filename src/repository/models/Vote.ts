import { BelongsToGetAssociationMixin, DataTypes, Model, Optional } from "sequelize";
import { Option } from "./Option";
import sequelize from "../sequelize";

export interface VoteAttributes {
    id: number;
    name: string;
    userId: number;
    optionId: number;
}

export interface VoteCreationAttributes extends Optional<VoteAttributes, "id"> { }

export class Vote extends Model<VoteAttributes, VoteCreationAttributes>
    implements VoteAttributes {
    public id!: number;
    public name!: string;
    public userId!: number;
    public optionId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getOption!: BelongsToGetAssociationMixin<Option>;
}

Vote.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        userId: {
            type: DataTypes.INTEGER,
            unique: "userId_optionId_UNIQUE",
        },
        optionId: {
            type: DataTypes.INTEGER,
            unique: "userId_optionId_UNIQUE",
        },
    },
    {
        sequelize,
        tableName: "votes",
        charset: "utf8mb4",
    }
);
