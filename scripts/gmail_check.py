import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.gmail import Gmail, get_body, get_headers

gmail = Gmail()
print("Connected as", gmail.address)

new_messages = gmail.list_new_message_ids(max_results=1)
if not new_messages:
    print("No new messages found.")
    sys.exit(0)

message_id = new_messages[0]
message = gmail.get_message(message_id)
headers = get_headers(message)
print(headers["from"], "|", headers.get("subject"))
print(get_body(message)[:500])

gmail.send_reply(message, "Thanks for your email. We received your message and will get back to you soon.\n\nNeem & Teak support")
print("Reply sent")
