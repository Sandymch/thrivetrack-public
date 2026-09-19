import json
import os

import boto3
from botocore.exceptions import ClientError


cognito_client = boto3.client(
    "cognito-idp",
    region_name="us-east-1"
)


def lambda_handler(event, context):
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return response(204, None)

    try:
        body = parse_body(event)

        email = body.get("email", "").strip().lower()
        first_name = body.get("firstName", "").strip()
        last_name = body.get("lastName", "").strip()

        if not email or not first_name or not last_name:
            return response(
                400,
                {
                    "message": (
                        "Email, First name and Last name are required"
                    )
                },
            )

        cognito_client.admin_create_user(
            UserPoolId=os.environ["USER_POOL_ID"],
            Username=email,
            UserAttributes=[
                {
                    "Name": "email",
                    "Value": email,
                },
                {
                    "Name": "email_verified",
                    "Value": "true",
                },
                {
                    "Name": "given_name",
                    "Value": first_name,
                },
                {
                    "Name": "family_name",
                    "Value": last_name,
                },
            ],
            DesiredDeliveryMediums=["EMAIL"],
        )

        return response(
            201,
            {
                "message": "User created successfully",
            },
        )

    except ValueError as error:
        return response(
            400,
            {
                "message": str(error),
            },
        )

    except cognito_client.exceptions.UsernameExistsException:
        return response(
            409,
            {
                "message": "This email is already registered",
            },
        )

    except KeyError as error:
        print(f"Missing environment variable: {error}")
        return response(
            500,
            {
                "message": "Internet server error",
            },
        )

    except ClientError as error:
        print(json.dumps(error.response, default=str))
        return response(
            500,
            {
                "message": "User creation failed",
            },
        )

    except Exception as error:
        print(str(error))
        return response(
            500,
            {
                "message": "Internet server error",
            },
        )


def parse_body(event):
    raw_body = event.get("body")

    if not raw_body:
        raise ValueError("Missing request body")

    if isinstance(raw_body, dict):
        return raw_body

    try:
        return json.loads(raw_body)
    except json.JSONDecodeError as error:
        raise ValueError("Invalid request body") from error


def response(status_code, body):
    result = {
        "statusCode": status_code,
        "headers": cors_headers(),
    }

    if body is not None:
        result["body"] = json.dumps(
            body,
            ensure_ascii=False,
        )

    return result


def cors_headers(): return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "OPTIONS,POST", }