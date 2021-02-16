import { getQuestion } from "./repository";

(async () => {
    try {
        var a = await getQuestion(58);
        console.log(JSON.stringify(a, null, 2));

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
