const Models = require("./models");

module.exports = class Repository {
    static getQuestion(questionId) {
        return Models.question.findById(questionId, {
            include: [
                {
                    model: Models.option,
                    include: [Models.vote]
                }
            ],
            order: "`options.id`, `options.votes.id`"
        });
    }

    static getQuestions(where) {
        return Models.question.findAll({
            where: where,
            include: [
                {
                    model: Models.option,
                    include: [Models.vote]
                }
            ],
            order: "`updatedAt` DESC, `options.id`, `options.votes.id`"
        });
    }

    static addQuestion(userId, name, question) {
        return Models.question.create({
            userId: userId,
            name: name,
            question: question
        });
    }

    static updateQuestion(questionId, data) {
        return Models.question.update(data, {
            where: {
                id: questionId
            }
        });
    }

    static addOption(questionId, option) {
        return Models.option.create({
            questionId: questionId,
            option: option
        });
    }

    static updateOption(optionId, data) {
        return Models.option.update(data, {
            where: {
                id: optionId
            }
        });
    }

    static removeOption(optionId) {
        return Models.option.destroy({
            where: {
                id: optionId
            }
        });
    }

    static addVote(optionId, userId, name) {
        return Models.vote.create({
            optionId: optionId,
            userId: userId,
            name: name
        });
    }

    static removeVote(optionId, userId) {
        return Models.vote.destroy({
            where: {
                optionId: optionId,
                userId: userId
            }
        });
    }
};
