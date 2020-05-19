const sequelize = require("./sequelize");
const Question = require("./models/Question");
const Option = require("./models/Option");
const Vote = require("./models/Vote");

Question.hasMany(Option);
Option.belongsTo(Question);
Option.hasMany(Vote);
Vote.belongsTo(Option);

function getQuestion(questionId) {
  return Question.findByPk(questionId, {
    include: [
      {
        model: Option,
        include: [Vote],
      },
    ],
    order: [
      [Option, "id", "ASC"],
      [Option, Vote, "id", "ASC"],
    ],
  });
}

function getQuestions(where) {
  return Question.findAll({
    where: where,
    include: [
      {
        model: Option,
        include: [Vote],
      },
    ],
    order: [
      ["updatedAt", "DESC"],
      [Option, "id", "ASC"],
      [Option, Vote, "id", "ASC"],
    ],
  });
}

function addQuestion(userId, name, question) {
  return Question.create({
    userId: userId,
    name: name,
    question: question,
  });
}

function updateQuestion(questionId, data) {
  return Question.update(data, {
    where: {
      id: questionId,
    },
  });
}

function addOption(questionId, option) {
  return Option.create({
    questionId: questionId,
    option: option,
  });
}

function updateOption(optionId, data) {
  return Option.update(data, {
    where: {
      id: optionId,
    },
  });
}

function removeOption(optionId) {
  return Option.destroy({
    where: {
      id: optionId,
    },
  });
}

function addVote(optionId, userId, name) {
  return Vote.create({
    optionId: optionId,
    userId: userId,
    name: name,
  });
}

function removeVote(optionId, userId) {
  return Vote.destroy({
    where: {
      optionId: optionId,
      userId: userId,
    },
  });
}

module.exports = {
  sequelize,
  Question,
  Option,
  Vote,
  getQuestion,
  getQuestions,
  addQuestion,
  updateQuestion,
  addOption,
  updateOption,
  removeOption,
  addVote,
  removeVote,
};
