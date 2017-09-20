const ddg = require('ddg');
const WA = require('wolfram');
let wolfram;

if (process.env.WOLFRAM_KEY !== undefined) {
    wolfram = WA.createClient(process.env.WOLFRAM_KEY);
}

const duck = question => new Promise(resolve => {
    ddg.query(question, (err, res) => {
        if (err || res === undefined) {
            return resolve();
        }
        if (res.AbstractText !== undefined && res.AbstractText !== '') {
            return resolve(res.AbstractText);
        }
        return resolve();
    })
});

const wolframAlpha = question => new Promise(resolve => {
    if (process.env.WOLFRAM_KEY === undefined) {
        return resolve();
    }
    wolfram.query(question, (err, result) => {
        if (err) {
            console.log(err);
            return resolve();
        }

        const resultBlock = result.find(item => item.primary);

        if (resultBlock !== undefined) {
            const subpod = resultBlock.subpods[0];
            const value = subpod.value;
            if (value !== undefined && value.length > 0) {
                return resolve(value);
            }
        }
        resolve();
    });
});

const getAnswer = question => {
    const wholeQuestion = question.originalMessage;
    return duck(wholeQuestion)
        .then(answer => {
            if (answer === undefined) {
                return wolframAlpha(wholeQuestion);
            }
            return answer;
        });
};

module.exports = {
    getAnswer
};
