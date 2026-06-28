import os
import json
from typing import Iterable
from .tokenizer import SimpleTokenizer


def iter_text_files(input_dir: str):
    for root, _, files in os.walk(input_dir):
        for f in files:
            if f.lower().endswith(".txt"):
                yield os.path.join(root, f)


def preprocess_to_jsonl(input_dir: str, tokenizer: SimpleTokenizer, out_path: str, seq_len: int = 128) -> None:
    """Les alle .txt i input_dir, tokeniser og chunk til sekvenser, skriv JSONL.

    Hver linje i output er: {"input_ids": [..]}
    """
    pieces = 0
    with open(out_path, "w", encoding="utf-8") as out_f:
        for fp in iter_text_files(input_dir):
            with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                txt = f.read()
            if not txt.strip():
                continue
            # bygg token liste uten BOS/EOS slik at chunking blir enklere
            ids = tokenizer.encode(txt, add_bos=False, add_eos=False)
            # fjern eventuelle spesialtokens hvis de ble lagt på
            # chunk og legg til BOS/EOS per chunk
            i = 0
            while i < len(ids):
                chunk = ids[i : i + max(1, seq_len - 2)]
                seq = [tokenizer.vocab[tokenizer.BOS]] + chunk + [tokenizer.vocab[tokenizer.EOS]]
                out_f.write(json.dumps({"input_ids": seq}, ensure_ascii=False) + "\n")
                pieces += 1
                i += len(chunk)
    print(f"Preprocessed {pieces} sequences to {out_path}")


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser()
    p.add_argument("--input_dir", default="data/raw", help="Folder with .txt files")
    p.add_argument("--out", default="data/train.jsonl", help="Output JSONL path")
    p.add_argument("--vocab", default="data/vocab.json", help="Path to save/load vocab")
    p.add_argument("--seq_len", type=int, default=128)
    args = p.parse_args()

    tok = SimpleTokenizer()
    # Build vocabulary from raw texts
    texts = []
    for fp in iter_text_files(args.input_dir):
        with open(fp, "r", encoding="utf-8", errors="ignore") as f:
            texts.append(f.read())
    tok.build_vocab(texts)
    os.makedirs(os.path.dirname(args.vocab), exist_ok=True)
    tok.save(args.vocab)
    preprocess_to_jsonl(args.input_dir, tok, args.out, seq_len=args.seq_len)
