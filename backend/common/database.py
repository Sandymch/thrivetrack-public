import os

import psycopg


def get_database_url() -> str:
    return (
        f"postgresql://{os.environ['DB_USER']}:{os.environ['DB_PASSWORD']}"
        f"@{os.environ['DB_HOST']}:{os.environ.get('DB_PORT', '5432')}"
        f"/{os.environ['DB_NAME']}?sslmode=require"
    )


def get_database_connection():
    return psycopg.connect(get_database_url())
