def delay_color(delay: int | None) -> str:
    """Return marker color based on delay."""
    if delay is None:
        return "gray"
    if delay > 120:
        return "red"
    if delay < -60:
        return "blue"
    return "green"

def format_delay(delay: int | None) -> str:
    """Convert delay in seconds to user-friendly minutes."""
    if delay is None:
        return "No info"
    minutes = round(delay / 60)
    sign = "+" if minutes > 0 else ""
    return f"{sign}{minutes} min"
