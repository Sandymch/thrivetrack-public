import os
import json

from common.api import create_response
from common.auth import AuthenticationError, get_user_id_from_event
from common.database import get_database_connection

def lambda_handler(event, context):
    try:
        user_id = get_user_id_from_event(event)

        query_params = event.get("queryStringParameters") or {}

        try:
            limit = int(query_params.get("limit", 20))
        
        except (ValueError, TypeError):
            return create_response(
                400,
                {
                    "error": "Invalid limit. Limit must be an integer.",
                },
            )
        
        limit = min(max(limit, 1), 100)  # Ensure limit is between 1 and 100

        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    select
                        record_id,
                        category_name,
                        task_name,
                        task_start_at,
                        task_end_at,
                        mental_demand_score,
                        physical_demand_score,
                        temporal_demand_score,
                        performance_score,
                        effort_score,
                        frustration_score,
                        raw_tlx_score
                    from workload_records
                    where user_id = %s
                    order by task_start_at desc
                    limit %s
                    """,
                    (user_id, limit),
                )

                rows = cur.fetchall()

        records = [
            {
                "recordId": str(row[0]),
                "categoryName": row[1],
                "taskName": row[2],
                "taskStartAt": row[3].isoformat() if row[3] else None,
                "taskEndAt": row[4].isoformat() if row[4] else None,
                
                "ratings" : {
                    "mentalDemand": row[5],
                    "physicalDemand": row[6],
                    "temporalDemand": row[7],
                    "performance": row[8],
                    "effort": row[9],
                    "frustration": row[10],
                },
                "rawTlxScore": float(row[11]),
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
    
    except ValueError as error:
        return create_response(
            401, 
            {
                "error": str(error),
            },
        )
    
    except Exception as error:
        return create_response(
            500,
            {
                "error": "Internal server error.",
                "details": str(error),
            },
        )


