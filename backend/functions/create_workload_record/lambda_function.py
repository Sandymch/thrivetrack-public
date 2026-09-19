import os
import json

from common.api import create_response
from common.auth import AuthenticationError, get_user_id_from_event
from common.database import get_database_connection

def lambda_handler(event, context):
    try:
        user_id = get_user_id_from_event(event)
        body = json.loads(event.get("body") or "{}")

        category_name = body["categoryName"].strip()
        task_name = body["taskName"].strip()
        task_start_at = body["taskStartAt"]
        task_end_at = body["taskEndAt"]
        ratings = body["ratings"]
        raw_tlx_score = body["rawTlxScore"]

        with get_database_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    insert into workload_categories (user_id, category_name)
                    values (%s, %s)
                    on conflict (user_id, category_name) do nothing
                    """,
                    (user_id, category_name),
                )

                cur.execute(
                    """
                    insert into workload_records (               
                        user_id, 
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
                    )
                    values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    returning record_id
                    """,
                    (
                        user_id,
                        category_name,
                        task_name,
                        task_start_at,
                        task_end_at,
                        ratings["mentalDemand"],
                        ratings["physicalDemand"],
                        ratings["temporalDemand"],
                        ratings["performance"],
                        ratings["effort"],
                        ratings["frustration"],
                        raw_tlx_score,
                    ),
                )
                record_id = cur.fetchone()[0]
            
            conn.commit()
        
        return create_response(
            201, 
            {"message": "Workload record created successfully", 
             "recordId": str(record_id)},
        )
    
    except KeyError as error:
        return create_response(
            400, 
            {"error": f"Missing required field: {str(error)}",
            },
        )
    
    except ValueError as error:
        return create_response(
            401, 
            {"error": str(error)},
        )
    
    except Exception as error:
        return create_response(
            500, 
            {
                "error": f"Internal server error: {str(error)}",
            },
        )