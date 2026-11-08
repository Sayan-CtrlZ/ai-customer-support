from email.utils import parseaddr

AUTOMATED_SENDER_TERMS = (
    "noreply",
    "no-reply",
    "no_reply",
    "donotreply",
    "do-not-reply",
    "do_not_reply",
    "mailer-daemon",
    "postmaster",
    "notifications",
    "notification",
    "newsletter",
    "newsletters",
    "digest",
    "bounce",
    "bounces",
    "automated",
    "updates",
    "alert",
    "alerts",
    "promo",
    "promotions",
    "marketing",
    "campaign",
    "jobs-noreply",
    "account-security",
)

BOUNCE_AND_ALERT_PHRASES = (
    "delivery status notification",
    "undelivered mail",
    "mail delivery subsystem",
    "address not found",
    "message blocked",
    "delivery incomplete",
    "failure notice",
    "mail delivery failed",
    "returned to sender",
    "automatic reply",
    "auto-reply",
    "out of office",
    "automated response",
    "verification code",
    "security alert",
    "sign in from a new device",
    "new login to your",
    "verify your email",
    "confirm your email",
    "one-time password",
    "your otp",
    "password reset",
)


def _is_automated_address(address: str) -> bool:
    if not address:
        return False
    address_lower = address.lower()
    local_part = address_lower.split("@")[0]
    return any(term in local_part for term in AUTOMATED_SENDER_TERMS) or (
        "noreply" in address_lower or "no-reply" in address_lower
    )


def skip_reason(message: dict, headers: dict[str, str], own_address: str) -> str | None:
    """Return why the bot must not answer this message, or None when it may."""
    labels = set(message.get("labelIds", []))

    # 1. Sent by us or from our own address
    if "SENT" in labels:
        return "sent by us"
    if "SPAM" in labels or "TRASH" in labels:
        return "marked as spam or trash"
    if "CATEGORY_PROMOTIONS" in labels:
        return "promotional email (CATEGORY_PROMOTIONS)"
    if "CATEGORY_SOCIAL" in labels:
        return "social network notification (CATEGORY_SOCIAL)"
    if "CATEGORY_FORUMS" in labels:
        return "forum or group notification (CATEGORY_FORUMS)"

    from_header = headers.get("from", "")
    sender = parseaddr(from_header)[1].lower()
    if not sender or sender == own_address.lower():
        return "from our own address or empty sender"

    reply_to = parseaddr(headers.get("reply-to", ""))[1].lower()

    # 2. Automated or no-reply sender address / header
    from_header_lower = from_header.lower()
    if any(term in from_header_lower for term in ("noreply", "no-reply", "donotreply", "do-not-reply", "mailer-daemon", "postmaster")):
        return f"automated or no-reply sender in header: {from_header}"
    if _is_automated_address(sender):
        return f"automated or no-reply sender: {sender}"
    if _is_automated_address(reply_to):
        return f"automated or no-reply reply-to: {reply_to}"

    # 3. Mailing lists, newsletters, and marketing mail (standard RFC headers)
    if "list-unsubscribe" in headers:
        return "mailing list or newsletter (list-unsubscribe present)"
    if "list-id" in headers:
        return f"mailing list: {headers['list-id']}"
    if "list-post" in headers:
        return "mailing list (list-post present)"
    if "list-help" in headers or "list-archive" in headers:
        return "mailing list (list headers present)"

    # 4. Standard auto-submitted and precedence headers
    auto_submitted = headers.get("auto-submitted", "no").strip().lower()
    if auto_submitted != "no":
        return f"auto-submitted: {auto_submitted}"

    precedence = headers.get("precedence", "").strip().lower()
    if precedence in {"bulk", "list", "junk"}:
        return f"bulk or list mail: {precedence}"

    if headers.get("x-autoreply") or headers.get("x-autorespond"):
        return "auto-reply header present"

    if headers.get("x-auto-response-suppress"):
        return f"auto-response suppressed: {headers['x-auto-response-suppress']}"

    # 5. Delivery failure bounces and automated system notices in Subject
    subject = headers.get("subject", "").lower()
    for phrase in BOUNCE_AND_ALERT_PHRASES:
        if phrase in subject:
            return f"automated notification or bounce: {headers.get('subject', '')}"

    return None
