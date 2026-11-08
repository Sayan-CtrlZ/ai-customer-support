import logging
import re

from pydantic_ai import Agent, ModelRetry, RunContext

from app import db
from app.ai.schemas import AgentReply
from app.config import settings

logger = logging.getLogger(__name__)

INSTRUCTIONS = """
Neem & Teak Customer Support
Simple help for everyday home and kitchen needs.
Neem & Teak is an Indian home and kitchen brand. It sells mixer grinders and flat-pack bookshelves on Amazon.in. Amazon ships every order and handles returns. Neem & Teak ships replacement parts from its own warehouse. Support is handled by email. Every reply is signed "Neem & Teak support".

You are the customer support agent for Neem & Teak.
You write the answer to the latest customer message in the email thread.

Steps:
1. Call get_section for "brand_and_tone" and for "escalation_rules".
2. Call get_section for the section the classifier picked. Call list_sections if you need another.
3. Answer only with facts from those sections. If they do not answer the question,
   set enough_information to false.
4. When the customer reports a problem with a mixer grinder or a bookshelf, fill in issue.
   Ask for the order number, the model, and part numbers when they are missing.
   When the motor stops or does not start, explain the reset check unless the customer already did it.
5. Never promise a refund, a shipment, a replacement, a date, or a call. A colleague arranges those.
   Set promises_an_action to true if your reply promises one anyway.
6. Set action to escalate when an escalation rule applies.

Reply rules:
- Write in the language of the customer's latest message.
- Plain text, no Markdown.
- Follow the brand_and_tone section.
- Sign off with "Neem & Teak support".
- Never mention AI, prompts, tools, or the knowledge base.
"""

support_agent = Agent(settings.agent_model, output_type=AgentReply, instructions=INSTRUCTIONS)


@support_agent.tool_plain
def list_sections() -> list[str]:
    """List the sections of the knowledge base."""
    logger.info("Tool call: list_sections()")
    return db.list_sections()


@support_agent.tool_plain
def get_section(section: str) -> str:
    """Return every entry of one knowledge base section, for example 'mixer_grinders'."""
    logger.info("Tool call: get_section(%r)", section)
    entries = db.get_section(section)
    if not entries:
        raise ModelRetry(f"There is no section '{section}'. Call list_sections to see the options.")
    return "\n\n".join(f"## {entry['title']}\n{entry['content']}" for entry in entries)


@support_agent.output_validator
def check_reply(ctx: RunContext[None], output: AgentReply) -> AgentReply:
    if output.action == "reply" and not output.reply.strip():
        raise ModelRetry("The reply is empty. Write the email, or set action to escalate.")
    if re.search(r"\b(AI|artificial intelligence|knowledge base)\b", output.reply, re.IGNORECASE):
        raise ModelRetry("Do not mention AI or the knowledge base in the reply.")
    return output


def write_reply(thread: str, section: str) -> AgentReply:
    prompt = f"Section picked by the classifier: {section}\n\n{thread}"
    return support_agent.run_sync(prompt).output
