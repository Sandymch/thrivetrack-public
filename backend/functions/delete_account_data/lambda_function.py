from common.api import create_response
from common.auth import AuthenticationError, get_user_id_from_event
from common.database import get_database_connection

def lambda_handler(event, context):
    try:
        user_id = get_user_id_from_event(event)

        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    delete from dass21_responses
                    where assessment_id in (
                        select assessment_id
                        from dass21_assessments
                        where user_id = %s
                    )
                    """,
                    (user_id,),
                )

                deleted_dass21_responses = cur.rowcount

                cur.execute(
                    """
                    delete from dass21_assessments
                    where user_id = %s
                    """,
                    (user_id,),
                )

                deleted_dass21_assessments = cur.rowcount

                cur.execute(
                    """
                    delete from workload_records
                    where user_id = %s
                    """,
                    (user_id,),
                )

                deleted_workload_records = cur.rowcount

                cur.execute(
                    """
                    delete from workload_categories
                    where user_id = %s
                    """,
                    (user_id,),
                )
                deleted_workload_categories = cur.rowcount

                cur.execute(
                    """
                    delete from user_notification_settings
                    where user_id = %s;
                    """,
                    (user_id,),
                )
                deleted_user_notification_settings = cur.rowcount

            conn.commit()

        return create_response(
            200,
            {
                "message": "Account data deleted successfully.",
                "deleted": {
                    "dass21Responses": deleted_dass21_responses,
                    "dass21Assessments": deleted_dass21_assessments,
                    "workloadRecords": deleted_workload_records,
                    "workloadCategories": deleted_workload_categories,
                    "userNotificationSettings": deleted_user_notification_settings,
                },
            },
        )

    except AuthenticationError as error:
        return create_response(
            401,
            {"error": str(error)},
        )

    except Exception as error:
        print(f"Failed to delete account data: {error}")

        return create_response(
            500,
            {"error": "Internal server error"},
        )