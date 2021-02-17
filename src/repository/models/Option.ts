import {
  Association, DataTypes, Model, Optional,
} from 'sequelize';
import { Vote } from './Vote';
import sequelize from '../sequelize';

export interface OptionAttributes {
  id: number;
  option: string;
  questionId: number;
}

export interface OptionCreationAttributes extends Optional<OptionAttributes, 'id'> { }

export class Option extends Model<OptionAttributes, OptionCreationAttributes>
  implements OptionAttributes {
  public id!: number;
  public option!: string;
  public questionId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

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
    },
    questionId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: 'options',
    charset: 'utf8mb4',
  },
);

Option.hasMany(Vote, { as: 'votes', foreignKey: 'optionId' });
