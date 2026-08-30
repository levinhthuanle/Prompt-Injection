import logging
import sys
import uuid


def get_request_id() -> str:
    return str(uuid.uuid4())[:8]


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


logger = logging.getLogger("uniguard")
