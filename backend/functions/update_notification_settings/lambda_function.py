import json

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

        body = json.loads(event.get("body") or "{}")

        wellbeing_reminder_enabled = body.get("wellbeingReminderEnabled")

        if type(wellbeing_reminder_enabled) is not bool:
            return create_response(
                400,
                {
                    "error": "wellbeingReminderEnabled must be a boolean."
                },
            )

        if not email:
            email = body.get("email")

        if not isinstance(email, str) or not email.strip():
            return create_response(
                400,
                {
                    "error": "User email is required for notification settings."
                },
            )

        email = email.strip()

        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    insert into user_notification_settings (
                        user_id,
                        email,
                        wellbeing_reminder_enabled,
                        updated_at
                    )
                    values (%s, %s, %s, now())
                    on conflict (user_id)
                    do update set
                        email = excluded.email,
                        wellbeing_reminder_enabled =
                            excluded.wellbeing_reminder_enabled,
                        updated_at = now()
                    returning
                        email,
                        wellbeing_reminder_enabled,
                        last_wellbeing_reminder_sent_at
                    """,
                    (
                        user_id,
                        email,
                        wellbeing_reminder_enabled,
                    ),
                )

                row = cur.fetchone()

            conn.commit()

        return create_response(
            200,
            {
                "message": "Notification settings updated successfully.",
                "email": row[0],
                "wellbeingReminderEnabled": row[1],
                "lastWellbeingReminderSentAt": (
                    row[2].isoformat() if row[2] else None
                ),
            },
        )

    except AuthenticationError as error:
        return create_response(401, {"error": str(error)})

    except json.JSONDecodeError:
        return create_response(400, {"error": "Invalid JSON body."})

    except Exception as error:
        print(f"Failed to update notification settings: {error}")
        return create_response(500, {"error": "Internal server error"})