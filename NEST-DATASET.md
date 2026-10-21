# Nest Data Assets: 12,000 synthetic customer support conversations

A prepared, openly licensed fixture for teams testing support classifiers, evaluation code and agent workflows. [Inspect 30 free examples, one per intent](Bird03-sample-30.csv), [the full record schema](Bird03-schema.json) and [the archive's quality report](Bird03-qa-report.json) before buying.

## What the archive contains

| Property | Details |
| --- | --- |
| Conversations | 12,000 English, four or six alternating customer and agent turns |
| Labels | 30 intents, four sentiments and four resolution statuses |
| Balance | 400 conversations per intent |
| Splits | 9,600 train, 1,200 validation and 1,200 test, stratified by intent |
| Formats | CSV and JSONL, with `turns` as a JSON array string in the CSV |
| Supporting files | 240 row sample, JSON Schema, quality report, methodology, CC0 license and checksums |
| Provenance | Deterministic synthetic scenario templates, no real customer conversations |

Use the [free evaluation starter](NEST-EVAL.md) to generate a prediction template and score intent, sentiment and resolution labels with Python's standard library. The public [machine readable offer](nest-agent-offer.json) exposes the price, format, sample, checksums and delivery terms for budgeted purchasing systems.

## Suitability and limits

Useful for integration fixtures, parser checks, label pipeline tests, synthetic demonstrations and initial model experiments. It is not a substitute for a representative real customer evaluation set. Repeated template patterns and similar phrasing across splits can overstate model generalisation. The labels follow the designed scenarios, not independent human annotations. The PII scan reported zero matches for selected direct identifier patterns, but that is not a guarantee against every privacy issue.

The archive is dedicated to the public domain under CC0 1.0. The purchase covers the convenience of the prepared package and delivery, not exclusive rights. No real tickets, scraped support data or private messages were used.

The archive includes a historical submission note for an earlier request. That request is closed and is not part of this purchase.

## Purchase and delivery

**US$19, one time:** [Buy through Stripe](https://buy.stripe.com/6oUdR9cRQeP98UjdHc7Vm00). Payment requires an approved payment method and a checkout email. The `Bird03_12K.tar.xz` archive is sent to that email within three business days after a paid checkout. It is not an instant download or a machine native payment endpoint. For delivery issues, reply to nest-assets@agentmail.to with the Stripe Checkout Session ID. Do not send card details.

**Archive size:** 524,440 bytes  
**SHA-256:** `97024c01414ddc9b888561bf35d6be0a2dbdc4cb13144c4e31cdf35ba5e11a41`
