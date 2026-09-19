from decimal import Decimal

from common.api import create_response
from common.auth import AuthenticationError, get_user_id_from_event
from common.database import get_database_connection

def to_float(value):
    if isinstance(value, Decimal):
        return float(value)
    return value

def lambda_handler(event, context):
    try:
        user_id = get_user_id_from_event(event)

        query_params = event.get("queryStringParameters") or {}
        months = int(query_params.get("months", 1))

        if months not in [1, 3, 6, 12]:
            months = 1  # Default to 1 month if invalid value is provided

        with get_database_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select
                        assessment_id,
                        assessment_start_at,
                        assessment_end_at,
                        depression_score,
                        anxiety_score,
                        stress_score
                    from dass21_assessments
                    where user_id = %s
                    order by assessment_end_at desc
                    limit 1
                    """,
                    (user_id,),
                )

                latest_row = cursor.fetchone()

                cursor.execute(
                    """
                    select
                        assessment_end_at,
                        depression_score,
                        anxiety_score,
                        stress_score
                    from dass21_assessments
                    where user_id = %s
                    and assessment_end_at >= now() - (%s * interval '1 month')
                    order by assessment_end_at
                    """,
                    (user_id, months),
                )

                trend_rows = cursor.fetchall()

        latest_assessment = None

        if latest_row is not None:
            latest_assessment = {
                "assessmentId": str(latest_row[0]),
                "assessmentStartAt": latest_row[1].isoformat(),
                "assessmentEndAt": latest_row[2].isoformat(),
                "scores": {
                    "depression": latest_row[3],
                    "anxiety": latest_row[4],
                    "stress": latest_row[5],
                },
            }

        trend = [
            {
                "periodStart": row[0].strftime("%Y-%m-%d"),
                "depression": row[1],
                "anxiety": row[2],
                "stress": row[3],
            }
            for row in trend_rows
        ]    

        return create_response(
            200,
            {
                "months": months,
                "latestAssessment": latest_assessment,
                "trend": trend,
            },
        )


    except AuthenticationError as error:
        return create_response(
            401,
            {"error": str(error)},
        )

    except ValueError:
        return create_response(
            400,
            {"error": "Months must be a number"},
        )

    except Exception as error:
        print(f"Failed to get DASS-21 summary: {error}")

        return create_response(
            500,
            {"error": "Internal server error"},
        )