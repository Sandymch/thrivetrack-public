create table dass21_assessments(
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,

    assessment_start_at timestamptz NOT NULL,
    assessment_end_at timestamptz NOT NULL,

    depression_score INTEGER NOT NULL,
    anxiety_score INTEGER NOT NULL,
    stress_score INTEGER NOT NULL,

    CONSTRAINT dass21_assessments_valid_period
        CHECK (assessment_start_at < assessment_end_at),
    
    CONSTRAINT dass21_assessments_depression_score_range
        CHECK (depression_score BETWEEN 0 AND 42),
    
    CONSTRAINT dass21_assessments_anxiety_score_range
        CHECK (anxiety_score BETWEEN 0 AND 42),
    
    CONSTRAINT dass21_assessments_stress_score_range
        CHECK (stress_score BETWEEN 0 AND 42)
);

create table dass21_responses(
    assessment_id UUID NOT NULL
        REFERENCES dass21_assessments (assessment_id)
        ON DELETE CASCADE,

    question_number INTEGER NOT NULL,
    response_score INTEGER NOT NULL,

    PRIMARY KEY (assessment_id, question_number),

    CONSTRAINT dass21_responses_question_number_range
        CHECK (question_number BETWEEN 1 AND 21),
    
    CONSTRAINT dass21_responses_score_range
        CHECK (response_score BETWEEN 0 AND 3)
);

create INDEX idx_dass21_assessments_user_end_at
    ON dass21_assessments (user_id, assessment_end_at DESC);