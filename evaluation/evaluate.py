import csv
import sys
import os

# Add backend to path to import analyzer
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from app.nlp.analyzer import MorphologicalAnalyzer

def evaluate():
    analyzer = MorphologicalAnalyzer()
    
    total = 0
    correct_prefix = 0
    correct_root = 0
    correct_suffix = 0
    
    with open('gold_standard.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            word = row['word']
            res = analyzer.analyze(word)
            
            total += 1
            if res.prefix == row['gold_prefix']: correct_prefix += 1
            if res.root == row['gold_root']: correct_root += 1
            if res.suffix == row['gold_suffix']: correct_suffix += 1
            
            print(f"{word:15} | Pred: ({res.prefix}, {res.root}, {res.suffix}) | Gold: ({row['gold_prefix']}, {row['gold_root']}, {row['gold_suffix']})")
            
    print(f"Total Words: {total}")
    print(f"Prefix Accuracy: {correct_prefix/total*100:.2f}%")
    print(f"Root Accuracy: {correct_root/total*100:.2f}%")
    print(f"Suffix Accuracy: {correct_suffix/total*100:.2f}%")

if __name__ == "__main__":
    evaluate()
