#!/usr/bin/env python3
"""Score intent, sentiment and resolution predictions against Bird03 data.

Uses only the Python standard library. The gold input can be the public CSV
sample, an unpacked CSV/JSONL file or the purchased .tar.xz archive.
"""

import argparse
import csv
import io
import json
import sys
import tarfile
from collections import Counter
from pathlib import Path

FIELDS = ("intent", "sentiment", "resolution_status")
SPLITS = ("all", "train", "validation", "test")


def read_rows(path, member=None):
    source = Path(path)
    if source.name.endswith(".tar.xz"):
        target = member or "customer_support_12000.csv"
        with tarfile.open(source, "r:xz") as archive:
            if target not in archive.getnames():
                raise ValueError(f"Archive member not found: {target}")
            handle = archive.extractfile(target)
            if handle is None:
                raise ValueError(f"Archive member is not a file: {target}")
            data = handle.read().decode("utf-8-sig")
        suffix = Path(target).suffix
    else:
        data = source.read_text(encoding="utf-8-sig")
        suffix = source.suffix

    if suffix == ".csv":
        reader = csv.DictReader(io.StringIO(data))
        if not reader.fieldnames:
            raise ValueError("CSV has no header")
        return list(reader)
    if suffix == ".jsonl":
        return [json.loads(line) for line in data.splitlines() if line.strip()]
    raise ValueError("Input must be CSV, JSONL or a .tar.xz archive")


def index_rows(rows, name):
    indexed = {}
    for row in rows:
        key = str(row.get("conversation_id", "")).strip()
        if not key:
            raise ValueError(f"{name} has a row without conversation_id")
        if key in indexed:
            raise ValueError(f"{name} has duplicate conversation_id: {key}")
        indexed[key] = row
    return indexed


def choose_gold(rows, split):
    if split == "all":
        return rows
    chosen = [row for row in rows if row.get("split") == split]
    if not chosen:
        raise ValueError(f"No gold rows for split '{split}'")
    return chosen


def template(args):
    rows = choose_gold(read_rows(args.gold, args.member), args.split)
    index_rows(rows, "Gold file")
    with open(args.out, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(("conversation_id",) + FIELDS)
        for row in rows:
            writer.writerow((row["conversation_id"], "", "", ""))
    print(f"Wrote {len(rows)} IDs to {args.out}. Fill predictions, then run score.")


def field_metrics(gold, predicted, field):
    pairs = [(str(gold[key][field]), str(predicted[key][field])) for key in gold]
    labels = sorted(set(a for a, _ in pairs) | set(b for _, b in pairs))
    exact = sum(a == b for a, b in pairs)
    by_label = {}
    for label in labels:
        tp = sum(a == label and b == label for a, b in pairs)
        fp = sum(a != label and b == label for a, b in pairs)
        fn = sum(a == label and b != label for a, b in pairs)
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        by_label[label] = {"support": sum(a == label for a, _ in pairs),
                           "precision": round(precision, 4),
                           "recall": round(recall, 4),
                           "f1": round(f1, 4)}
    errors = Counter((a, b) for a, b in pairs if a != b)
    return {
        "accuracy": round(exact / len(pairs), 4),
        "macro_f1": round(sum(v["f1"] for v in by_label.values()) / len(labels), 4),
        "labels": by_label,
        "top_confusions": [{"actual": a, "predicted": b, "count": n}
                           for (a, b), n in errors.most_common(10)],
    }


def score(args):
    gold_rows = choose_gold(read_rows(args.gold, args.member), args.split)
    gold = index_rows(gold_rows, "Gold file")
    predictions = index_rows(read_rows(args.predictions), "Predictions file")
    missing = sorted(gold.keys() - predictions.keys())
    extra = sorted(predictions.keys() - gold.keys())
    if missing or extra:
        raise ValueError(
            f"Predictions must match selected gold IDs exactly: "
            f"{len(missing)} missing, {len(extra)} extra. "
            f"First missing: {missing[:3]}; first extra: {extra[:3]}"
        )
    for key, row in predictions.items():
        for field in FIELDS:
            if not str(row.get(field, "")).strip():
                raise ValueError(f"Missing {field} prediction for {key}")
    report = {
        "gold": str(args.gold),
        "split": args.split,
        "rows_scored": len(gold),
        "metrics": {field: field_metrics(gold, predictions, field) for field in FIELDS},
        "note": "Scores measure agreement with synthetic scenario labels, not real-world performance.",
    }
    print(json.dumps(report, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    for command in ("template", "score"):
        p = sub.add_parser(command)
        p.add_argument("--gold", required=True, help="Public sample, full CSV/JSONL or .tar.xz")
        p.add_argument("--member", help="Archive member; default customer_support_12000.csv")
        p.add_argument("--split", choices=SPLITS, default="all")
        if command == "template":
            p.add_argument("--out", required=True, help="CSV output path")
        else:
            p.add_argument("--predictions", required=True, help="CSV or JSONL predictions")
    args = parser.parse_args()
    try:
        template(args) if args.command == "template" else score(args)
    except (OSError, ValueError, KeyError, csv.Error, json.JSONDecodeError,
            tarfile.TarError) as exc:
        parser.exit(2, f"Error: {exc}\n")


if __name__ == "__main__":
    main()
