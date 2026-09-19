import json
import os
from datetime import datetime, timedelta, timezone

import boto3
from botocore.config import Config

from common.database import get_database_connection


EMAIL_SENDER_FUNCTION_NAME = os.environ["EMAIL_SENDER_FUNCTION_NAME"]
FRONTEND_URL = os.environ["FRONTEND_URL"]

BOTO_CONFIG = Config(
    connect_timeout=3,
    read_timeout=8,
    retries={"max_attempts": 1},
)


def build_email_message() -> str:
    check_in_url = f"{FRONTEND_URL}/dashboard/wellbeing/new"

    return f"""
Hi,

Your next ThriveTrack wellbeing check-in is now available.

DASS-21 is designed to reflect how you have felt over the past week. You can complete your next check-in here:

{check_in_url}

This reminder is for self-reflection only and does not provide diagnosis, treatment, or clinical advice.

Best,
ThriveTrack
""".strip()


def send_email_via_sender_lambda(email: str) -> str:
    lambda_client = boto3.client(
        "lambda",
        config=BOTO_CONFIG,
    )

    payload = {
        "email": email.strip(),
        "subject": "Your ThriveTrack wellbeing check-in is available",
        "message": build_email_message(),
    }

    response = lambda_client.invoke(
        FunctionName=EMAIL_SENDER_FUNCTION_NAME,
        InvocationType="RequestResponse",
        Payload=json.dumps(payload).encode("utf-8"),
    )

    response_payload = response["Payload"].read().decode("utf-8")
    result = json.loads(response_payload)

    if "FunctionError" in response:
        raise RuntimeError(result)

    if not result.get("success"):
        raise RuntimeError(result.get("error", "Failed to send email."))

    return result["messageId"]


def is_reminder_due(
    now: datetime,
    latest_assessment_end_at: datetime | None,
    last_reminder_sent_at: datetime | None,
) -> bool:
    if latest_assessment_end_at is not None:
        next_available_at = latest_assessment_end_at + timedelta(days=7)

        if now < next_available_at:
            return False

    if last_reminder_sent_at is not None:
        next_reminder_at = last_reminder_sent_at + timedelta(days=7)

        if now < next_reminder_at:
            return False

    return True


def lambda_handler(event, context):
    now = datetime.now(timezone.utc)

    checked_count = 0
    sent_count = 0
    skipped_count = 0
    failed = []

    with get_database_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select
                    s.user_id,
                    s.email,
                    max(a.assessment_end_at) as latest_assessment_end_at,
                    s.last_wellbeing_reminder_sent_at
                from user_notification_settings s
                left join dass21_assessments a
                    on s.user_id = a.user_id
                where s.wellbeing_reminder_enabled = true
                group by
                    s.user_id,
                    s.email,
                    s.last_wellbeing_reminder_sent_at
                """
            )

            rows = cur.fetchall()

            for row in rows:
                user_id = row[0]
                email = row[1].strip()
                latest_assessment_end_at = row[2]
                last_reminder_sent_at = row[3]

                checked_count += 1

                if not is_reminder_due(
                    now,
                    latest_assessment_end_at,
                    last_reminder_sent_at,
                ):
                    skipped_count += 1
                    continue

                try:
                    message_id = send_email_via_sender_lambda(email)

                    cur.execute(
                        """
                        update user_notification_settings
                        set
                            last_wellbeing_reminder_sent_at = now(),
                            updated_at = now()
                        where user_id = %s
                        """,
                        (user_id,),
                    )

                    sent_count += 1

                    print(
                        f"Sent wellbeing reminder to {email}, "
                        f"user_id={user_id}, message_id={message_id}"
                    )

                except Exception as error:
                    failed.append(
                        {
                            "userId": user_id,
                            "email": email,
                            "error": str(error),
                        }
                    )

                    print(
                        f"Failed to send wellbeing reminder to {email}: {error}"
                    )

            conn.commit()

    return {
        "checked": checked_count,
        "sent": sent_count,
        "skipped": skipped_count,
        "failed": failed,
    }