import os
import json
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

        try:
            months = int(query_params.get("months", 1))
        
        except (TypeError, ValueError):
            return create_response(400, {"error": "Invalid months value."})

        if months not in {1, 3, 6, 12}:
            return create_response(
                400,
                {"error": "Months must be one of 1, 3, 6, or 12."},
            )

        with get_database_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    select
                        category_name,
                        count(*) as task_count
                    from workload_records
                    where user_id = %s
                      and task_start_at >= now() - (%s * interval '1 month')
                    group by category_name
                    order by task_count desc;
                    """,
                    (user_id, months),
                )

                category_rows = cursor.fetchall()
                total_tasks = sum(row[1] for row in category_rows)

                category_distribution = [
                    {
                        "categoryName": row[0],
                        "taskCount": row[1],
                        "percentage": round((row[1] / total_tasks) * 100, 1)
                        if total_tasks > 0
                        else 0,
                    }
                    for row in category_rows
                ]

                trend_group = "day" if months == 1 else "month"

                cursor.execute(
                    f"""
                    select
                        date_trunc('{trend_group}', task_start_at) as period_start,
                        avg(raw_tlx_score) / 10 as average_score,
                        count(*) as task_count
                    from workload_records
                    where user_id = %s
                    and task_start_at >= now() - (%s * interval '1 month')
                    group by period_start
                    order by period_start;
                    """,
                    (user_id, months),
                )

                trend_rows = cursor.fetchall()

                trend = [
                    {
                        "periodStart": row[0].strftime("%Y-%m-%d")
                        if months == 1
                        else row[0].strftime("%Y-%m"),
                        "averageScore": round(to_float(row[1]), 1),
                        "taskCount": row[2],
                    }
                    for row in trend_rows
                ]

                cursor.execute(
                    """
                    select
                        date_trunc('day', task_start_at) as period_start,
                        category_name,
                        avg(raw_tlx_score) / 10 as average_score,
                        count(*) as task_count
                    from workload_records
                    where user_id = %s
                        and task_start_at >= now() - (%s * interval '1 month')
                    group by period_start, category_name
                    order by period_start, category_name;
                    """,
                    (user_id, months),
                )

                category_trend_rows = cursor.fetchall()

                category_trend_map = {}

                for row in category_trend_rows:
                    period_start = row[0].strftime("%Y-%m-%d")
                    category_name = row[1]
                    average_score = round(to_float(row[2]), 1)

                    if period_start not in category_trend_map:
                        category_trend_map[period_start] = {
                            "periodStart": period_start,
                        }

                    category_trend_map[period_start][category_name] = average_score

                category_trend = list(category_trend_map.values())

        return create_response(
            200,
            {
                "months": months,
                "categoryDistribution": category_distribution,
                "trend": trend,
                "categoryTrend": category_trend,
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