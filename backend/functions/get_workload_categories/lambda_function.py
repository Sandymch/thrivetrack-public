import os
import json

from common.api import create_response
from common.auth import AuthenticationError, get_user_id_from_event
from common.database import get_database_connection

DEFAULT_CATEGORIES = [
    "Project Work",
    "Study",
    "Meetings",
]

def lambda_handler(event, context):
    try:
        user_id = get_user_id_from_event(event)

        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    select category_name
                    from workload_categories
                    where user_id = %s
                    order by category_name;
                    """,
                    (user_id,),
                )

                rows = cur.fetchall()
        user_categories = [row[0] for row in rows]

        categories = list(dict.fromkeys(DEFAULT_CATEGORIES + user_categories))

        return create_response(
            200,
            {
                "categories": categories,
            },
        )

    except ValueError as error:
        return create_response(401, {"error": str(error)})

    except Exception as error:
        return create_response(
            500,
            {
                "error": "Internal server error.",
                "details": str(error),
            },
        )