from app.core.config import settings


def get_security_config() -> dict:
    return {
        "mode": settings.security_mode,
        "enable_input_detection": settings.enable_input_detection,
        "enable_document_isolation": settings.enable_document_isolation,
        "enable_tool_authorization": settings.enable_tool_authorization,
        "enable_output_filter": settings.enable_output_filter,
    }


def is_protected_mode() -> bool:
    return settings.security_mode.lower() == "protected"


def is_vulnerable_mode() -> bool:
    return settings.security_mode.lower() == "vulnerable"
