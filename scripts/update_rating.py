#!/usr/bin/env python3
"""
Fetch ratings from Google Sheet and update README.md
Requires: pip install gspread google-auth
"""

import os
import re
import json
import gspread
from google.oauth2.service_account import Credentials

# ─── CONFIG ──────────────────────────────────────────────
SHEET_ID = os.getenv("GOOGLE_SHEET_ID")          # Set in GitHub Secrets
CREDS_JSON = os.getenv("GOOGLE_CREDS_JSON")      # Set in GitHub Secrets
README_PATH = "README.md"
# ─────────────────────────────────────────────────────────

# Column mapping: Google Sheet column → (label, emoji)
# Adjust column letters if your sheet differs
COLUMNS = {
    "D": ("UI/UX", "🎨"),
    "E": ("Ease of Use", "⚙️"),
    "F": ("Visual Design", "🖌️"),
    "G": ("Affix Functionality", "🔧"),
    "H": ("Word Family & Tree", "🌳"),
    "I": ("Accuracy", "✅"),
    "J": ("Performance", "🚀"),
    "K": ("Innovation", "💡"),
    "L": ("NLP Clarity", "🧠"),
    "M": ("Overall Quality", "🏗️"),
    "N": ("Overall", "⭐"),
}


def get_google_client():
    """Authenticate with Google Sheets API using service account."""
    if not CREDS_JSON:
        raise RuntimeError("GOOGLE_CREDS_JSON env var not set")
    creds_dict = json.loads(CREDS_JSON)
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
    ]
    creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
    return gspread.authorize(creds)


def fetch_ratings():
    """Fetch all responses and compute averages for each rating column."""
    if not SHEET_ID:
        raise RuntimeError("GOOGLE_SHEET_ID env var not set")

    gc = get_google_client()
    sh = gc.open_by_key(SHEET_ID)
    ws = sh.sheet1  # assumes responses are in first tab

    # Get all values (includes header row)
    data = ws.get_all_values()
    if len(data) < 2:
        print("No responses yet")
        return {}

    # First row = headers, rest = responses
    headers = data[0]
    rows = data[1:]

    # Map column letters to indices
    col_indices = {}
    for letter, (label, _) in COLUMNS.items():
        idx = ord(letter.upper()) - ord("A")
        if idx < len(headers):
            col_indices[letter] = idx
        else:
            print(f"Warning: Column {letter} not found in sheet")

    # Compute averages
    ratings = {}
    for letter, idx in col_indices.items():
        values = []
        for row in rows:
            if idx < len(row):
                try:
                    val = float(row[idx])
                    if 1 <= val <= 5:
                        values.append(val)
                except ValueError:
                    pass
        if values:
            avg = round(sum(values) / len(values), 2)
            ratings[letter] = avg
            print(f"  {COLUMNS[letter][0]} ({letter}): {avg} / 5 (n={len(values)})")
        else:
            print(f"  {COLUMNS[letter][0]} ({letter}): no valid responses")

    return ratings


def update_readme(ratings):
    """Replace the ratings table in README.md."""
    if not os.path.exists(README_PATH):
        print(f"README not found at {README_PATH}")
        return

    with open(README_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Build the new table
    lines = ["## 📊 Community Ratings (Affixa)", "", "| Category | Rating |", "|----------|--------|"]
    for letter, (label, emoji) in COLUMNS.items():
        if letter in ratings:
            lines.append(f"| {emoji} {label} | **{ratings[letter]} / 5** |")
        else:
            lines.append(f"| {emoji} {label} | — |")

    total_responses = len(ratings)  # approximate
    if ratings:
        overall = ratings.get("N", round(sum(ratings.values()) / len(ratings), 2))
        lines.append(f"| {COLUMNS['N'][1]} **Overall** | **{overall} / 5** |")
    lines.append("")
    lines.append(f"*Based on responses • Auto-updated weekly*")
    lines.append("")

    new_table = "\n".join(lines)

    # Replace between markers
    start_marker = "<!-- RATINGS_START -->"
    end_marker = "<!-- RATINGS_END -->"

    if start_marker in content and end_marker in content:
        pattern = re.compile(f"{re.escape(start_marker)}.*?{re.escape(end_marker)}", re.DOTALL)
        new_content = pattern.sub(f"{start_marker}\n{new_table}\n{end_marker}", content)
    else:
        # Append at end if markers not found
        new_content = content.rstrip() + f"\n\n{start_marker}\n{new_table}\n{end_marker}\n"

    with open(README_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"✅ Updated {README_PATH}")


if __name__ == "__main__":
    try:
        ratings = fetch_ratings()
        if ratings:
            update_readme(ratings)
        else:
            print("No ratings to update")
    except Exception as e:
        print(f"❌ Error: {e}")
        exit(1)