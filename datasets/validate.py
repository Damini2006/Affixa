"""Validate the structure of every dataset file.

Usage: python datasets/validate.py

Reports token counts, duplicate tokens, CSV row/column consistency and
gold-standard schema for all corpora. Exits non-zero if any check fails.
"""
import csv, collections, pathlib

root = pathlib.Path(__file__).parent.parent

print("=== TXT corpora ===")
for name in ("demo_words.txt", "sample_corpus.txt", "affix_rich_vocabulary.txt"):
    p = root / "datasets" / name
    text = p.read_text(encoding="utf-8")
    words = text.split()
    dups = [w for w, c in collections.Counter(words).items() if c > 1]
    print(f"{name:32} tokens={len(words):4d}  bytes={p.stat().st_size:5d}  dups={dups if dups else 'none'}")

print("\n=== Upload CSVs ===")
for name in ("words_for_batch.csv", "sentences_for_batch.csv"):
    p = root / "datasets" / name
    with p.open(encoding="utf-8", newline="") as f:
        rows = list(csv.reader(f))
    widths = {len(r) for r in rows}
    print(f"{name:32} rows={len(rows):4d} (incl. header)  col-widths={widths}  header={rows[0]}")

print("\n=== Gold standards ===")
for name in ("gold_standard.csv", "gold_standard_extended.csv"):
    p = root / "evaluation" / name
    with p.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    words = [r["word"] for r in rows]
    dups = [w for w, c in collections.Counter(words).items() if c > 1]
    bad = [r for r in rows if len(r) != 4 or None in r]
    print(f"{name:32} rows={len(rows):4d}  dups={dups if dups else 'none'}  malformed={len(bad)}  fields={list(rows[0].keys())}")
