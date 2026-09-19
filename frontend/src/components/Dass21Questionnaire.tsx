import {
    CloudRain,
    HeartPulse,
    Zap,
} from "lucide-react";

import type { ReactNode } from "react";

import {
    DASS21_QUESTIONS,
    type Dass21QuestionKey,
    type Dass21Responses,
    type Dass21Subscale,
} from "../features/wellbeing/dass21";

type Dass21Tone = "purple" | "coral" | "orange" | "mauve" | "red";

type Dass21Option = {
    value: number;
    label: string;
    description: string;
};

const DASS21_OPTIONS: Dass21Option[] = [
    {
        value: 0,
        label: "0",
        description: "Did not apply to me at all",
    },
    {
        value: 1,
        label: "1",
        description: "Applied to me to some degree",
    },
    {
        value: 2,
        label: "2",
        description: "Applied to me to a considerable degree",
    },
    {
        value: 3,
        label: "3",
        description: "Applied to me very much",
    },
];

type SubscaleVisual = {
    icon: ReactNode;
    tone: Dass21Tone;
};

function getSubscaleVisual(subscale: Dass21Subscale): SubscaleVisual {
    if (subscale === "depression") {
        return {
            icon: <CloudRain size={26} />,
            tone: "purple",
        };
    }

    if (subscale === "anxiety") {
        return {
            icon: <HeartPulse size={26} />,
            tone: "coral",
        };
    }

    return {
        icon: <Zap size={26} />,
        tone: "orange",
    };
}

type Dass21QuestionnaireProps = {
    responses: Dass21Responses;
    onResponseChange: (
        key: Dass21QuestionKey,
        value: number
    ) => void;
};

function Dass21Questionnaire({
    responses,
    onResponseChange,
}: Dass21QuestionnaireProps) {
    return (
        <section className="wellbeing-question-list">
            {DASS21_QUESTIONS.map((question) => {
                const visual = getSubscaleVisual(question.subscale);

                return (
                    <QuestionRow
                        key={question.key}
                        questionKey={question.key}
                        questionNumber={question.number}
                        questionText={question.text}
                        value={responses[question.key]}
                        icon={visual.icon}
                        tone={visual.tone}
                        onChange={(value) =>
                            onResponseChange(question.key, value)
                        }
                    />
                );
            })}
        </section>
    );
}

type QuestionRowProps = {
    questionKey: Dass21QuestionKey;
    questionNumber: number;
    questionText: string;
    value: number | null;
    icon: ReactNode;
    tone: Dass21Tone;
    onChange: (value: number) => void;
};

function QuestionRow({
    questionKey,
    questionNumber,
    questionText,
    value,
    icon,
    tone,
    onChange,
}: QuestionRowProps) {
    const toneClass = `wellbeing-question-icon-${tone}`;

    return (
        <article className="dashboard-card wellbeing-question-row">
            <div className={`wellbeing-question-icon ${toneClass}`}>
                {icon}
            </div>

            <div className="wellbeing-question-copy">
                <h2>Question {questionNumber}</h2>
                <p>{questionText}</p>
            </div>

            <div className="wellbeing-option-grid">
                {DASS21_OPTIONS.map((option) => (
                    <label
                        key={option.value}
                        className={`wellbeing-option ${
                            value === option.value
                                ? "wellbeing-option-selected"
                                : ""
                        }`}
                    >
                        <input
                            type="radio"
                            name={questionKey}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                        />

                        <strong>{option.label}</strong>
                        <span>{option.description}</span>
                    </label>
                ))}
            </div>
        </article>
    );
}

export default Dass21Questionnaire;