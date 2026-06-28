import json
import re
from collections import Counter
from typing import Iterable, List, Optional


class SimpleTokenizer:
    PAD = "<pad>"
    UNK = "<unk>"
    BOS = "<bos>"
    EOS = "<eos>"

    def __init__(self):
        self.special_tokens = [self.PAD, self.UNK, self.BOS, self.EOS]
        self.vocab: dict[str, int] = {}
        self.id_to_token: dict[int, str] = {}
        self._counter = Counter()
        self._built = False

    def _tokenize(self, text: str) -> List[str]:
        text = text.strip()
        # Enkelt regex‑basert tokenizer: ord eller enkelttegn (punctuation)
        tokens = re.findall(r"\w+|[^\w\s]", text, re.UNICODE)
        return tokens

    def build_vocab(self, texts: Iterable[str], min_freq: int = 1, max_size: Optional[int] = None) -> None:
        for t in texts:
            self._counter.update(self._tokenize(t))

        # start med spesialtokens
        self.vocab = {}
        idx = 0
        for tok in self.special_tokens:
            self.vocab[tok] = idx
            idx += 1

        # legg til vanlige tokens etter frekvens
        most_common = [tok for tok, freq in self._counter.most_common() if freq >= min_freq]
        if max_size is not None:
            most_common = most_common[:max_size]

        for tok in most_common:
            if tok in self.vocab:
                continue
            self.vocab[tok] = idx
            idx += 1

        self.id_to_token = {id_: tok for tok, id_ in self.vocab.items()}
        self._built = True

    def encode(self, text: str, add_bos: bool = True, add_eos: bool = True, max_length: Optional[int] = None) -> List[int]:
        if not self._built:
            raise ValueError("Vokabular ikke bygget. Kall build_vocab() først.")
        ids: List[int] = []
        if add_bos:
            ids.append(self.vocab[self.BOS])
        for tok in self._tokenize(text):
            ids.append(self.vocab.get(tok, self.vocab[self.UNK]))
            if max_length is not None and len(ids) >= max_length:
                break
        if add_eos and (max_length is None or len(ids) < max_length):
            ids.append(self.vocab[self.EOS])
        return ids

    def decode(self, ids: List[int]) -> str:
        toks: List[str] = []
        for i in ids:
            tok = self.id_to_token.get(i, self.UNK)
            # hopp over spesialtokens i output
            if tok in (self.BOS, self.EOS, self.PAD):
                continue
            toks.append(tok)
        return " ".join(toks).replace("  ", " ").strip()

    def save(self, path: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"vocab": self.vocab}, f, ensure_ascii=False)

    @classmethod
    def load(cls, path: str) -> "SimpleTokenizer":
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        tok = cls()
        tok.vocab = data.get("vocab", {})
        tok.id_to_token = {int(k): v for v, k in ((v, k) for k, v in tok.vocab.items())} if False else {v: k for k, v in tok.vocab.items()}
        # id_to_token must be id->token
        tok.id_to_token = {id_: tok for tok, id_ in tok.vocab.items()}
        tok._built = True
        return tok
