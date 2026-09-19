from common.api import create_response
from common.auth import AuthenticationError, get_user_id_from_event
from common.database import get_database_connection


def get_email_from_event(event: dict) -> str | None:
    claims = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
    )

    return claims.get("email")


def lambda_handler(event, context):
    try:
        user_id = get_user_id_from_event(event)
        email = get_email_from_event(event)

        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    select
                        email,
                        wellbeing_reminder_enabled,
                        last_wellbeing_reminder_sent_at
                    from user_notification_settings
                    where user_id = %s
                    """,
                    (user_id,),
                )

                row = cur.fetchone()

        if row is None:
            return create_response(
                200,
                {
                    "email": email,
                    "wellbeingReminderEnabled": False,
                    "lastWellbeingReminderSentAt": None,
                },
            )

        return create_response(
            200,
            {
                "email": row[0],
                "wellbeingReminderEnabled": row[1],
                "lastWellbeingReminderSentAt": (
                    row[2].isoformat() if row[2] else None
                ),
            },
        )

    except AuthenticationError as error:
        return create_response(401, {"error": str(error)})

    except Exception as error:
        print(f"Failed to get notification settings: {error}")
        return create_response(500, {"error": "Internal server error"})