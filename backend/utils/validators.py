def validate_diagnostic_request(data: dict) -> tuple[bool, str]:
    """Validate diagnostic generation request"""
    if not data.get('user_id'):
        return False, "user_id is required"
    if not data.get('chapter'):
        return False, "chapter is required"
    return True, ""

def validate_submission(data: dict) -> tuple[bool, str]:
    """Validate diagnostic submission"""
    if not data.get('user_id'):
        return False, "user_id is required"
    if not data.get('diagnostic_id'):
        return False, "diagnostic_id is required"
    if not data.get('answers'):
        return False, "answers are required"
    return True, ""

