import Models from "./models";
import Promise from "bluebird";

export default class Repository {
    static getQuestion(questionId) {
        return new Promise((resolve, reject) => {
            Models.question
                .findById(questionId, {
                    include: [
                        {
                            model: Models.choice,
                            include: [Models.vote]
                        }
                    ]
                })
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    static addQuestion(userId, name, question) {
        return new Promise((resolve, reject) => {
            Models.question
                .create({
                    userId: userId,
                    name: name,
                    question: question
                })
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    static updateQuestion(questionId, data) {
        return new Promise((resolve, reject) => {
            Models.question
                .update(data, {
                    where: {
                        id: questionId
                    }
                })
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    static addChoice(questionId, choice) {
        return new Promise((resolve, reject) => {
            Models.choice
                .create({
                    questionId: questionId,
                    choice: choice
                })
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
