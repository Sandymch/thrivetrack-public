class AuthenticationError(Exception):
    pass


def get_user_id_from_event(event: dict) -> str:
    claims = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
    )

    user_id = claims.get("sub")

    if not user_id:
        raise AuthenticationError("Missing authenticated user ID")

    return user_id