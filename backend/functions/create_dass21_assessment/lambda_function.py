import json
from datetime import datetime, timedelta, timezone

from common.api import create_response
from common.auth import AuthenticationError, get_user_id_from_event
from common.database import get_database_connection

DEPRESSION_QUESTIONS = {3, 5, 10, 13, 16, 17, 21}
ANXIETY_QUESTIONS = {2, 4, 7, 9, 15, 19, 20}
STRESS_QUESTIONS = {1, 6, 8, 11, 12, 14, 18}

EXPECTED_QUESTION_KEYS = {f"q{number}" for number in range(1, 22)}

def validate_responses(responses: object) -> dict[int, int]:
    if not isinstance(responses, dict):
        raise ValueError("Responses must be an object")
    
    provided_keys = set(responses.keys())

    if provided_keys != EXPECTED_QUESTION_KEYS:
        missing_questions = sorted(
            EXPECTED_QUESTION_KEYS - provided_keys,
            key=lambda key: int(key.removeprefix("q")),
        )
        
        unexpected_questions = sorted(
            provided_keys - EXPECTED_QUESTION_KEYS,
        )

        if missing_questions:
            missing_numbers = [
                key.removeprefix("q") for key in missing_questions
            ]

            raise ValueError(
                f"Missing responses for questions: {', '.join(missing_numbers)}"
            )
        
        raise ValueError(
            f"Unexpected question numbers: {', '.join(unexpected_questions)}"
        )
    
    validated_responses = {}

    for question_key, score in responses.items():
        if type(score) is not int or not 0 <= score <= 3:
            question_number = question_key.removeprefix("q")

            raise ValueError(
                f"Response for question {question_number} must be an integer from 0 to 3"
            )

        question_number = int(question_key.removeprefix("q"))
        validated_responses[question_number] = score
    
    return validated_responses


def calculate_scores(responses: dict[int, int]) -> dict[str, int]:
    depression_score = sum(
        responses[number] for number in DEPRESSION_QUESTIONS
    ) * 2

    anxiety_score = sum(
        responses[number] for number in ANXIETY_QUESTIONS
    ) * 2

    stress_score = sum(
        responses[number] for number in STRESS_QUESTIONS
    ) * 2

    return {
        "depression": depression_score,
        "anxiety": anxiety_score,
        "stress": stress_score,
    }

def lambda_handler(event, context):
    try:
        user_id = get_user_id_from_event(event)
        body = json.loads(event.get("body") or "{}")

        responses = validate_responses(body["responses"])
        scores = calculate_scores(responses)

        assessment_end_at = datetime.now(timezone.utc)
        assessment_start_at = assessment_end_at - timedelta(days=7)

        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    select assessment_end_at
                    from dass21_assessments
                    where user_id = %s
                    order by assessment_end_at desc
                    limit 1
                    """,
                    (user_id,),
                )

                latest_assessment = cur.fetchone()

                if latest_assessment is not None:
                    latest_end_at = latest_assessment[0]
                    next_available_at = latest_end_at + timedelta(days=7)

                    if assessment_end_at < next_available_at:
                        return create_response(
                            409,
                            {
                                "error": "You have already completed a DASS-21 check-in recently. Please wait until 7 days have passed before submitting another one.",
                                "nextAvailableAt": next_available_at.isoformat(),
                            },
                        )

                cur.execute(
                    """
                    insert into dass21_assessments (
                        user_id,
                        assessment_start_at,
                        assessment_end_at, 
                        depression_score,
                        anxiety_score,
                        stress_score
                    )
                    values (%s, %s, %s, %s, %s, %s)
                    returning assessment_id
                    """,
                    (
                        user_id,
                        assessment_start_at,
                        assessment_end_at,
                        scores["depression"],
                        scores["anxiety"],
                        scores["stress"],
                    ),
                )

                assessment_id = cur.fetchone()[0]

                cur.executemany(
                    """
                    insert into dass21_responses (
                        assessment_id,
                        question_number,
                        response_score
                    )
                    values (%s, %s, %s)
                    """,
                    [
                        (
                            assessment_id,
                            question_number,
                            responses[question_number],
                        )
                        for question_number in range(1, 22)
                    ],
                )

            conn.commit()

        return create_response(
            201,
            {
                "message": "DASS-21 assessment created successfully",
                "assessmentId": str(assessment_id),
                "assessmentStartAt": assessment_start_at.isoformat(),
                "assessmentEndAt": assessment_end_at.isoformat(),
                "scores": scores,
            },
        )
    
    except AuthenticationError as error:
        return create_response(
            401,
            {"error": str(error)},
        )

    except KeyError as error:
        return create_response(
            400,
            {"error": f"Missing required field: {str(error)}"},
        )

    except (ValueError, json.JSONDecodeError) as error:
        return create_response(
            400,
            {"error": str(error)},
        )

    except Exception as error:
        print(f"Failed to create DASS-21 assessment: {error}")

        return create_response(
            500,
            {"error": "Internal server error"},
        )