# Datasets & Sample Upload Files

Ready-to-use corpora for the **Batch Corpus Processor**, API smoke-testing and
engine evaluation — plus the schema and usage reference for every file.

Everything in this guide is verified: each upload file was POSTed to
`/api/analyze/text` (all returned `200 OK`), and `datasets/validate.py`
re-checks structure on demand.

---

## 1. At a glance

| File | Type | Size | Contents | Primary use |
|------|------|------|----------|-------------|
| [`datasets/demo_words.txt`](../datasets/demo_words.txt) | TXT word list | 1.4 KB | 119 affix-rich words | Quick Batch upload demo |
| [`datasets/sample_corpus.txt`](../datasets/sample_corpus.txt) | TXT prose | 1.6 KB | 4 paragraphs, ~260 tokens | Realistic document upload |
| [`datasets/affix_rich_vocabulary.txt`](../datasets/affix_rich_vocabulary.txt) | TXT word list | 4.0 KB | 391 words, zero duplicates | Stress test / coverage run |
| [`datasets/words_for_batch.csv`](../datasets/words_for_batch.csv) | CSV, 1 column | 1.3 KB | header + 101 words | CSV upload format demo |
| [`datasets/sentences_for_batch.csv`](../datasets/sentences_for_batch.csv) | CSV, 1 column | 2.5 KB | header + 30 sentences | Sentence-level upload |
| [`evaluation/gold_standard.csv`](../evaluation/gold_standard.csv) | CSV, 4 columns | 0.2 KB | 10 labeled words | Original accuracy check |
| [`evaluation/gold_standard_extended.csv`](../evaluation/gold_standard_extended.csv) | CSV, 4 columns | 5.6 KB | 159 labeled words | Full accuracy evaluation |
| [`datasets/validate.py`](../datasets/validate.py) | Python | — | Structure validator | CI / pre-commit checks |
| [`evaluation/evaluate.py`](../evaluation/evaluate.py) | Python | — | Scoring script | Accuracy reporting |

```
Affixa/
├── datasets/
│   ├── demo_words.txt               # 119-token quick demo
│   ├── sample_corpus.txt            # paragraph-style document
│   ├── affix_rich_vocabulary.txt    # 391-token stress corpus
│   ├── words_for_batch.csv          # one word per row
│   ├── sentences_for_batch.csv      # one sentence per row
│   └── validate.py                  # verifies all of the above
└── evaluation/
    ├── gold_standard.csv            # 10-row labeled set
    ├── gold_standard_extended.csv   # 159-row labeled set
    └── evaluate.py                  # scores the analyzer
```

---

## 2. Quick start — three ways to use these files

### A. Upload on the Batch page (UI)

1. Start both servers (`python backend/run.py`, `npm run dev` in `frontend/`).
2. Open **`http://localhost:5174/batch`** (Batch Corpus Processor).
3. Click the upload field (`accept=".txt,.csv"`) and pick any file from `datasets/`.
4. Press **Process** — the file's raw text is sent to `POST /api/analyze/text`.
5. Review the per-token table, then **Export CSV** to download results.

> **Note:** every alphabetic run becomes a token, including CSV header cells.
> Uploading `words_for_batch.csv` yields 102 tokens — the header word `word`
> plus the 101 data rows. This is expected and harmless.

### B. Call the API directly

```bash
# POSIX shells: flatten newlines, then post
curl -X POST http://127.0.0.1:8000/api/analyze/text \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$(tr '\n' ' ' < datasets/demo_words.txt)\"}"
```

```python
# Python (stdlib only)
import json, pathlib, urllib.request

text = pathlib.Path("datasets/demo_words.txt").read_text(encoding="utf-8")
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/analyze/text",
    data=json.dumps({"text": text}).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
print(len(json.load(urllib.request.urlopen(req))))   # -> 119
```

### C. Evaluate engine accuracy

```bash
cd evaluation
python evaluate.py                         # 10-row original set
python evaluate.py gold_standard_extended.csv   # 159-row extended set
```

---

## 3. File reference

### 3.1 `datasets/demo_words.txt` — quick demo

- **Format:** plain UTF-8 text; words separated by whitespace, 8 per line.
- **Token count:** 119 (no duplicate tokens).
- **Content:** everyday prefixed/suffixed forms — `unhappiness`, `overgeneralization`,
  `counterproductive`, `misunderstanding`, `transcontinental`, …
- **Verified:** `200 OK`, 119 tokens returned, 119 flagged `is_valid`.

```
unhappiness international disconnection rewriting prearranged hopelessness
counterproductive beautification misunderstandings reactivation unpredictability
...
```

### 3.2 `datasets/sample_corpus.txt` — realistic document

- **Format:** plain UTF-8 prose, 4 paragraphs on morphological analysis.
- **Token count:** ~260 via the API tokenizer (259 whitespace words).
- **Content:** a genuine multi-paragraph document — exercises sentence
  punctuation, commas, hyphenated affixes (`re-`, `mis-`) and mixed vocabulary.
- **Verified:** `200 OK`, 260 tokens returned.
- Function words (`the`, `is`, `of`) correctly come back `is_valid: false`
  because they are not WordNet lemmas of content morphology — expected behaviour.

### 3.3 `datasets/affix_rich_vocabulary.txt` — stress corpus

- **Format:** plain UTF-8 text, 391 tokens, zero duplicates, 10 words per line.
- **Content:** systematic coverage of 20+ prefixes (`un re pre dis mis over under
  inter non sub counter anti trans co de en out up in im ir il`) and 40+ suffixes
  (`-ness -ful -less -ing -ed -er -est -ly -ment -able -ity -tion -al -ous -ive
  -ance -ence -ship -hood -ward -ish -en -ize -s -es -ies`), including long
  edge cases like `antidisestablishmentarianism`.
- **Verified:** `200 OK`, 391 tokens, 390 valid.
- Use this file for coverage runs: it exercises nearly every branch of the
  affix dictionary and the spelling-rule table in one request.

### 3.4 `datasets/words_for_batch.csv` — one word per row

- **Schema:** single column, header `word`, 101 data rows (102 lines total).
- **Encoding:** UTF-8, LF line endings, no quoting needed (single field, no commas).
- **Verified:** `200 OK`, 102 tokens (header + rows).

```csv
word
unhappiness
international
disconnection
...
```

### 3.5 `datasets/sentences_for_batch.csv` — one sentence per row

- **Schema:** single column, header `text`, 30 data rows (31 lines total).
- **Quoting:** sentences containing commas are double-quoted per RFC 4180, so
  the file also opens cleanly in Excel/Sheets.
- **Verified:** `200 OK`, 211 tokens, 170 valid.

```csv
text
"The morphological analyzer decomposes words into meaningful units."
"Prefixes and suffixes modify the meaning of a base root."
...
```

### 3.6 Gold-standard CSVs (`evaluation/`)

Both files share one schema consumed by `evaluate.py`:

| Column | Type | Meaning | Empty value |
|--------|------|---------|-------------|
| `word` | string | Target word to analyze | — |
| `gold_prefix` | string | Human-labeled prefix morpheme | empty cell = no prefix |
| `gold_root` | string | Human-labeled base lemma | never empty |
| `gold_suffix` | string | Human-labeled suffix morpheme | empty cell = no suffix |

- **`gold_standard.csv`** — the original 10-row smoke set.
- **`gold_standard_extended.csv`** — 159 rows, no duplicates, no malformed rows.
  Extends the original 10 (kept verbatim, rows 1–10) with 149 words covering:
  - allomorph prefixes (`im-`, `ir-`, `il-`, `in-`), all productive `re-`/`pre-`/
    `dis-`/`mis-`/`over-`/`under-` families, `non-`, `sub-`, `anti-`, `trans-`,
    `co-`, `de-`, `en-`, `out-`
  - full suffix inventory (`-ness -ful -less -er -est -ly -ment -able -ship
    -hood -ward -ish -en -ize -ance -ence -ous -ive -ity -al -tion/-ation/-ion`)
  - inflectional forms (plurals `-s/-es/-ies`, `ing`/`ed` with gemination:
    `running`, `swimming`, `getting`)

**Labeling convention** (follows the original file):
root = canonical lemma (`run` for *running*, `make` for *makings*), affix spells
the boundary form the engine returns (`tion` for *disconnection*), and words
with no prefix/suffix leave that cell empty.

---

## 4. Evaluation

```bash
cd evaluation
python evaluate.py gold_standard_extended.csv
```

**Current baseline** (rule-based engine, measured on these files):

| Dataset | Words | Prefix acc. | Root acc. | Suffix acc. |
|---------|------:|------------:|----------:|------------:|
| `gold_standard.csv` | 10 | 90.00% | 80.00% | 90.00% |
| `gold_standard_extended.csv` | 159 | **94.97%** | **76.10%** | **80.50%** |

Metric definition: exact string match of each field against the gold label,
per word, summed over the dataset. These numbers move as the engine changes —
re-run the command to refresh them rather than trusting this table blindly.

---

## 5. Exported results format

The Batch page's **Export CSV** button writes
`affixa_batch_<timestamp>.csv`:

```csv
Word,Prefix,Root,Suffix,Rule,Confidence,Valid
"unhappiness","un","happy","ness","y → i restoration",99%,true
```

| Column | Meaning |
|--------|---------|
| `Word` | Original token as analyzed |
| `Prefix` / `Root` / `Suffix` | Decomposition (empty strings when absent) |
| `Rule` | Morphophonological rule applied (`none` if no restoration) |
| `Confidence` | Deterministic score as an integer percent |
| `Valid` | `true` when the root is a WordNet lemma |

---

## 6. Validating datasets

```bash
python datasets/validate.py
```

Checks and reports:
- token counts, byte sizes and duplicate tokens for every TXT corpus
- CSV row counts, header names and column-width consistency
- gold files: row counts, duplicate words, malformed rows, exact field names

Exit output is a table like:

```
demo_words.txt                   tokens= 119  bytes= 1457  dups=none
words_for_batch.csv              rows= 102 (incl. header)  col-widths={1}  header=['word']
gold_standard_extended.csv       rows= 159  dups=none  malformed=0
```

Run it after editing any dataset; it is fast (<1 s) and dependency-free.

---

## 7. Authoring your own datasets

**Do**

- Save as **UTF-8** (any line-ending style works).
- Use `.txt` for free text and `.csv` for structured rows — the processor
  tokenizes both identically.
- Quote CSV fields containing commas (`"…"`) so the file also opens in
  spreadsheet apps.
- Keep gold files at exactly `word,gold_prefix,gold_root,gold_suffix` with
  empty cells for missing affixes.
- Keep requests to a few thousand tokens; processing is linear, but the HTTP
  response carries one JSON object per token.

**Don't**

- Add `#` comment lines to TXT uploads — comment markers are stripped and the
  words after them are analyzed as content (`# note:` yields tokens `note`).
- Rely on column position in upload CSVs — only word content matters.
- Put the service-role key or any secret in a dataset file.

---

## 8. Related documentation

- [`docs/API.md`](API.md) — full REST reference incl. `POST /api/analyze/text`
- [`docs/TESTING.md`](TESTING.md) — automated test suite
- [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) — where tokenization happens
- `README.md` → *Running Tests* and *Troubleshooting*

All datasets are part of the Affixa work and covered by the
[Apache License 2.0](../LICENSE).
