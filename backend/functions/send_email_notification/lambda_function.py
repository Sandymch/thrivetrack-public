import os
import re

import boto3


SES_REGION = os.environ.get("SES_REGION", "us-east-1").strip()
SENDER_EMAIL = os.environ["SENDER_EMAIL"].strip()

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

ses_client = boto3.client("ses", region_name=SES_REGION)


def validate_email(value: object, field_name: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string.")

    email = value.strip()

    if not EMAIL_PATTERN.match(email):
        raise ValueError(
            f"{field_name} is not a valid email address: {repr(value)}"
        )

    return email


def validate_text(value: object, field_name: str) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string.")

    text = value.strip()

    if not text:
        raise ValueError(f"{field_name} is required.")

    return text


def lambda_handler(event, context):
    try:
        recipient_email = validate_email(event.get("email"), "email")
        sender_email = validate_email(SENDER_EMAIL, "SENDER_EMAIL")

        subject = validate_text(event.get("subject"), "subject")
        message = validate_text(event.get("message"), "message")

        response = ses_client.send_email(
            Source=sender_email,
            Destination={
                "ToAddresses": [recipient_email],
            },
            Message={
                "Subject": {
                    "Data": subject,
                    "Charset": "UTF-8",
                },
                "Body": {
                    "Text": {
                        "Data": message,
                        "Charset": "UTF-8",
                    },
                },
            },
        )

        return {
            "success": True,
            "messageId": response["MessageId"],
        }

    except Exception as error:
        print(f"Failed to send email notification: {error}")

        return {
            "success": False,
            "error": str(error),
        }