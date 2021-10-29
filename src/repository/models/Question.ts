import {
  Association, DataTypes, Model, Optional,
} from 'sequelize';
import { Option } from './Option';
import sequelize from '../sequelize';

export interface QuestionAttributes {
  id: number;
  question: string;
  userId: number;
  name: string;
  isEnabled: boolean;
  isShareAllowed: boolean;
}

export interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id'> { }

export class Question extends Model<QuestionAttributes, QuestionCreationAttributes>
  implements QuestionAttributes {
  public id!: number;
  public question!: string;
  public userId!: number;
  public name!: string;
  public isEnabled!: boolean;
  public isShareAllowed!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly options?: Option[];

  public static associations: {
    options: Association<Question, Option>;
  };
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING(4096),
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
    },
    isShareAllowed: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize,
    tableName: 'questions',
    charset: 'utf8mb4',
  },
);

Question.hasMany(Option, { as: 'options', foreignKey: 'questionId' });
