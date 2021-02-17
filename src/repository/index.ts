import { WhereOptions } from "sequelize/types";
import { Option, OptionAttributes } from "./models/Option";
import { Question, QuestionAttributes } from "./models/Question";
import { Vote } from "./models/Vote";
import sequelize from "./sequelize";

export function sync() {
    return sequelize.sync({ alter: true });
}

export function getQuestion(questionId: number) {
    return Question.findByPk(questionId, {
        include: [{
            association: Question.associations.options,
            include: [Option.associations.votes],
        }],
        order: [
            [Question.associations.options, "id", "ASC"],
            [Question.associations.options, Option.associations.votes, "id", "ASC"],
        ],
    });
}

export function getQuestions(where: WhereOptions) {
    return Question.findAll({
        where,
        include: [{
            association: Question.associations.options,
            include: [Option.associations.votes],
        }],
        order: [
            ["updatedAt", "DESC"],
            [Question.associations.options, "id", "ASC"],
            [Question.associations.options, Option.associations.votes, "id", "ASC"],
        ],
    });
}

export function addQuestion(userId: number, name: string, question: string) {
    return Question.create({
        userId: userId,
        name: name,
        question: question,
        isEnabled: false,
        isShareAllowed: false
    });
}

export function updateQuestion(questionId: number, values: Partial<QuestionAttributes>) {
    return Question.update(values, {
        where: {
            id: questionId,
        },
    });
}

export function addOption(questionId: number, option: string) {
    return Option.create({
        questionId,
        option
    });
}

export function updateOption(optionId: number, values: Partial<OptionAttributes>) {
    return Option.update(values, {
        where: {
            id: optionId,
        },
    });
}

export function removeOption(optionId: number) {
    return Option.destroy({
        where: {
            id: optionId,
        },
    });
}

export function addVote(optionId: number, userId: number, name: string) {
    return Vote.create({
        optionId,
        userId,
        name,
    });
}

export function removeVote(optionId: number, userId: number) {
    return Vote.destroy({
        where: {
            optionId,
            userId,
        },
    });
}
