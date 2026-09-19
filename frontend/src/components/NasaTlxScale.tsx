import {
    Brain,
    Clock,
    Frown,
    Star,
    User,
    Zap,
} from "lucide-react";
import type { ReactNode } from "react";

export type NasaTlxRatingKey =
    | "mentalDemand"
    | "physicalDemand"
    | "temporalDemand"
    | "performance"
    | "effort"
    | "frustration";

export type NasaTlxRatings = Record<NasaTlxRatingKey, number>;

type RatingItem = {
    key: NasaTlxRatingKey;
    title: string;
    description: string;
    icon: ReactNode;
    tone: "purple" | "blue" | "coral" | "orange" | "mauve" | "red";
};

const RATING_ITEMS: RatingItem[] = [
    {
        key: "mentalDemand",
        title: "Mental Demand",
        description: "How much thinking and concentration was required?",
        icon: <Brain size={26} />,
        tone: "purple",
    },
    {
        key: "physicalDemand",
        title: "Physical Demand",
        description: "How much physical effort was required?",
        icon: <User size={26} />,
        tone: "blue",
    },
    {
        key: "temporalDemand",
        title: "Temporal Demand",
        description: "How much time pressure did you feel?",
        icon: <Clock size={26} />,
        tone: "coral",
    },
    {
        key: "performance",
        title: "Performance",
        description:
            "How unsuccessful were you in accomplishing the task?",
        icon: <Star size={26} />,
        tone: "orange",
    },
    {
        key: "effort",
        title: "Effort",
        description:
            "How hard did you have to work to achieve your level of performance?",
        icon: <Zap size={26} />,
        tone: "mauve",
    },
    {
        key: "frustration",
        title: "Frustration",
        description:
            "How stressed, discouraged, or annoyed did you feel?",
        icon: <Frown size={26} />,
        tone: "red",
    },
];

export const INITIAL_NASA_TLX_RATINGS: NasaTlxRatings = {
    mentalDemand: 0,
    physicalDemand: 0,
    temporalDemand: 0,
    performance: 0,
    effort: 0,
    frustration: 0,
};

type NasaTlxScaleProps = {
    ratings: NasaTlxRatings;
    onRatingChange: (
        key: NasaTlxRatingKey,
        value: number
    ) => void;
};

function NasaTlxScale({
    ratings,
    onRatingChange,
}: NasaTlxScaleProps) {
    return (
        <section className="nasa-rating-list">
            {RATING_ITEMS.map((item) => (
                <RatingRow
                    key={item.key}
                    item={item}
                    value={ratings[item.key]}
                    onChange={(value) =>
                        onRatingChange(item.key, value)
                    }
                />
            ))}
        </section>
    );
}

type RatingRowProps = {
    item: RatingItem;
    value: number;
    onChange: (value: number) => void;
};

function RatingRow({
    item,
    value,
    onChange,
}: RatingRowProps) {
    const toneClass = `nasa-rating-icon-${item.tone}`;

    return (
        <article className="dashboard-card nasa-rating-row">
            <div className={`nasa-rating-icon ${toneClass}`}>
                {item.icon}
            </div>

            <div className="nasa-rating-copy">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
            </div>

            <div className="nasa-slider-wrap">
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={value}
                    aria-label={item.title}
                    onChange={(event) =>
                        onChange(Number(event.target.value))
                    }
                />

                <div className="nasa-slider-labels">
                    {Array.from({ length: 11 }, (_, value) => (
                        <span key={value}>{value}</span>
                    ))}
                </div>
            </div>

            <div className="nasa-rating-value">
                <strong>{value}</strong>
                <span>/10</span>
            </div>
        </article>
    );
}

export default NasaTlxScale;