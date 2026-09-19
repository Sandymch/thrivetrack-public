from common.api import create_response
from common.auth import AuthenticationError, get_user_id_from_event
from common.database import get_database_connection

def lambda_handler(event, context):
    try:
        user_id = get_user_id_from_event(event)

        query_params = event.get("queryStringParameters") or {}
        limit = int(query_params.get("limit", 5))  # Default limit to 5 if not provided

        if limit < 1:
            limit = 5

        if limit > 100:
            limit = 100

        with get_database_connection() as conn:
            with conn.cursor() as cursor:
                # Fetch DASS-21 assessments for the authenticated user with limit
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
                    limit %s
                    """,
                    (user_id, limit),
                )

                rows = cursor.fetchall()

        records = [
            {
                "assessmentId": str(row[0]),
                "assessmentStartAt": row[1].isoformat(),
                "assessmentEndAt": row[2].isoformat(),
                "scores": {
                    "depression": row[3],
                    "anxiety": row[4],
                    "stress": row[5],
                },
            }
            for row in rows
        ]

        return create_response(
            200, 
            {
                "records": records,
                "count": len(records),
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
            {"error": "Limit must be a number"},
        )

    except Exception as error:
        print(f"Failed to get DASS-21 assessments: {error}")

        return create_response(
            500,
            {"error": "Internal server error"},
        )