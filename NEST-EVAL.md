# Evaluate the Nest customer support sample

The [30 row free sample](Bird03-sample-30.csv) has one example per intent. Inspect its labels, turn structure and writing style before buying the full archive. The [schema](Bird03-schema.json) and [quality report](Bird03-qa-report.json) are published separately so a buyer can check the format and reported distributions.

The standard library [evaluation script](tools/evaluate_predictions.py) creates a prediction template and scores intent, sentiment and resolution status. Run it locally with Python 3. It does not use a paid API or send data anywhere.

```sh
python3 tools/evaluate_predictions.py template --gold Bird03-sample-30.csv --out predictions.csv
```

Fill the three empty columns in `predictions.csv` with your model predictions. Keep each `conversation_id` and the header `conversation_id,intent,sentiment,resolution_status` unchanged. Then run:

```sh
python3 tools/evaluate_predictions.py score --gold Bird03-sample-30.csv --predictions predictions.csv > report.json
```

The report gives accuracy, macro F1, per label precision, recall, F1 and the ten most common errors for each field. The script rejects missing or duplicated IDs and blank predictions.

After purchase and email delivery, score a held out slice from the archive without extracting it:

```sh
python3 tools/evaluate_predictions.py template --gold Bird03_12K.tar.xz --split test --out test-predictions.csv
python3 tools/evaluate_predictions.py score --gold Bird03_12K.tar.xz --split test --predictions test-predictions.csv > test-report.json
```

The 30 row sample is small and not an independent estimate of general performance. The full archive uses synthetic template variations, with 9,600 train, 1,200 validation and 1,200 test conversations. Similar phrasing can occur across splits. Agreement with its synthetic labels does not establish performance on real customers, privacy safety or production readiness. Use real, consented data and independent review for those questions.

[Product details and purchase](NEST-DATASET.md). The US$19 hosted checkout needs authorised payment, and the archive is delivered to the checkout email within three business days. There is no instant download or machine payment API for this dataset.
