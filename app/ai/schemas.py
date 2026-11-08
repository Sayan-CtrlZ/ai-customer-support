from typing import Literal

from pydantic import BaseModel, Field

Section = Literal["mixer-grinders", "bookshelves", "returns-and-warranty", "shipping", "other"]


class Classification(BaseModel):
    section: Section
    language: str = Field(description="Language of the latest customer message, e.g. English")
    needs_human: bool = Field(description="True when an always-escalate rule applies")
    reason: str = Field(description="One sentence explaining the classification")
    acknowledgement: str = Field(
        description="Short note to the customer, in their language, that a colleague replies"
    )


class Issue(BaseModel):
    product: Literal["mixer-grinder", "bookshelf"]
    problem: Literal[
        "missing-accessory", "motor-stops", "smoke-or-sparks",
        "missing-hardware", "damaged-panels", "damaged-frame", "wrong-finish",
    ]
    order_number: str | None = None
    days_since_delivery: int | None = None
    reset_checked: bool = Field(default=False, description="True when the overload protector reset check was done")
    part_numbers: list[str] = Field(
        default_factory=list, description="Part numbers of damaged panels, e.g. NT-S3-04"
    )


class AgentReply(BaseModel):
    action: Literal["reply", "escalate"]
    reply: str = Field(description="The email to the customer, plain text")
    reasoning: str = Field(description="Which knowledge base entries you used, and why")
    enough_information: bool = Field(description="True when the knowledge base answers the question")
    promises_an_action: bool = Field(
        description="True when the reply promises a refund, shipment, replacement, date, or call"
    )
    issue: Issue | None = Field(
        default=None, description="Fill in when the customer reports a problem with a product"
    )


class Decision(BaseModel):
    action: Literal["reply", "escalate"]
    section: str
    reply: str
    reason: str
    proposed_action: str | None = None
