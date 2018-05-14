import Models from "./models";

export default class Repository {
    static getQuestion(questionId) {
        return Models.question.findById(questionId, {
            include: [
                {
                    model: Models.choice,
                    include: [Models.vote]
                }
            ]
        });
    }

    static getQuestions(where) {
        return Models.question.findAll({
            where: where,
            include: [
                {
                    model: Models.choice,
                    include: [Models.vote]
                }
            ],
            order: "`updatedAt` DESC, `choices.id`, `choices.votes.id`"
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

    static getChoices(questionId) {
        return Models.choice.findAll({
            where: {
                questionId: questionId
            }
        });
    }

    static addChoice(questionId, choice) {
        return Models.choice.create({
            questionId: questionId,
            choice: choice
        });
    }

    static updateChoice(choiceId, data) {
        return Models.choice.update(data, {
            where: {
                id: choiceId
            }
        });
    }

    static removeChoice(choiceId) {
        return Models.choice.destroy({
            where: {
                id: choiceId
            }
        });
    }

    static addVote(choiceId, userId, name) {
        return Models.vote.create({
            choiceId: choiceId,
            userId: userId,
            name: name
        });
    }

    static removeVote(choiceId, userId) {
        return Models.vote.destroy({
            where: {
                choiceId: choiceId,
                userId: userId
            }
        });
    }
}
