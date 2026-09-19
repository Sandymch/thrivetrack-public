export type Dass21QuestionKey =
    | "q1"
    | "q2"
    | "q3"
    | "q4"
    | "q5"
    | "q6"
    | "q7"
    | "q8"
    | "q9"
    | "q10"
    | "q11"
    | "q12"
    | "q13"
    | "q14"
    | "q15"
    | "q16"
    | "q17"
    | "q18"
    | "q19"
    | "q20"
    | "q21";

export type Dass21Subscale = "depression" | "anxiety" | "stress";

export type Dass21Responses = Record<Dass21QuestionKey, number | null>;

export const INITIAL_DASS21_RESPONSES: Dass21Responses = {
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: null,
    q7: null,
    q8: null,
    q9: null,
    q10: null,
    q11: null,
    q12: null,
    q13: null,
    q14: null,
    q15: null,
    q16: null,
    q17: null,
    q18: null,
    q19: null,
    q20: null,
    q21: null,
};

export type Dass21Question = {
    key: Dass21QuestionKey;
    number: number;
    text: string;
    subscale: Dass21Subscale;
};

export const DASS21_QUESTIONS: Dass21Question[] = [
    {
        key: "q1",
        number: 1,
        text: "I found it hard to wind down",
        subscale: "stress",
    },
    {
        key: "q2",
        number: 2,
        text: "I was aware of dryness of my mouth",
        subscale: "anxiety",
    },
    {
        key: "q3",
        number: 3,
        text: "I couldn't seem to experience any positive feeling at all",
        subscale: "depression",
    },
    {
        key: "q4",
        number: 4,
        text: "I exeperienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion",
        subscale: "anxiety",
    },
    {
        key: "q5",
        number: 5,
        text: "I found it difficult to work up the initiative to do things",
        subscale: "depression",
    },
    {
        key: "q6",
        number: 6,
        text: "I tended to over-react to situations",
        subscale: "stress",
    },
    {
        key: "q7",
        number: 7,
        text: "I experienced trembling (e.g. in the hands)",
        subscale: "anxiety",
    },
    {
        key: "q8",
        number: 8,
        text: "I felt that I was using a lot of nervous energy",
        subscale: "stress",
    },
    {
        key: "q9",
        number: 9,
        text: "I was worried about situations in which I might panic and make a fool of myself",
        subscale: "anxiety",
    },
    {
        key: "q10",
        number: 10,
        text: "I felt that I had nothing to look forward to",
        subscale: "depression",
    },
    {
        key: "q11",
        number: 11,
        text: "I found myself getting agitated",
        subscale: "stress",
    },
    {
        key: "q12",
        number: 12,
        text: "I found it difficult to relax",
        subscale: "stress",
    },
    {
        key: "q13",
        number: 13,
        text: "I felt down-hearted and blue",
        subscale: "depression",
    },
    {
        key: "q14",
        number: 14,
        text: "I was intolerant of anything that kept me from getting on with what I was doing",
        subscale: "stress",
    },
    {
        key: "q15",
        number: 15,
        text: "I felt I was close to panic",
        subscale: "anxiety",
    },
    {
        key: "q16",
        number: 16,
        text: "I was unable to become enthusiastic about anything",
        subscale: "depression",
    },
    {
        key: "q17",
        number: 17,
        text: "I felt I wasn’t worth much as a person",
        subscale: "depression",
    },
    {
        key: "q18",
        number: 18,
        text: "I felt that I was rather touchy ",
        subscale: "stress",
    },
    {
        key: "q19",
        number: 19,
        text: "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat)",
        subscale: "anxiety",
    },
    {
        key: "q20",
        number: 20,
        text: "I felt scared without any good reason",
        subscale: "anxiety",
    },
    {
        key: "q21",
        number: 21,
        text: "I felt that life was meaningless",
        subscale: "depression",
    },
];

export function calculateDass21Scores(responses: Dass21Responses) {
    let depresiionRaw = 0;
    let anxietyRaw = 0;
    let stressRaw = 0;

    DASS21_QUESTIONS.forEach((question) => {
        const value = responses[question.key];

        if (value === null) {
            return;
        }

        if (question.subscale === "depression"){
            depresiionRaw += value;
        }

        if (question.subscale === "anxiety"){
            anxietyRaw += value;
        }

        if (question.subscale === "stress"){
            stressRaw += value;
        }
    });

    return {
        depressionScore: depresiionRaw * 2,
        anxietyScore: anxietyRaw * 2,
        stressScore: stressRaw * 2,
    };
}