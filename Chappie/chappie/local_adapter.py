from typing import List, Optional

import torch

from .model_adapter import ModelAdapter
from .tokenizer import SimpleTokenizer
from .model import SimpleCausalTransformer


class LocalModelAdapter(ModelAdapter):
    """Adapter som laster en lagret PyTorch‑sjekkpunkt og genererer med greedy decoding.

    For demo: forventer at checkpoint er en dict med keys: model_state_dict, vocab_size, seq_len
    """

    def __init__(self, checkpoint_path: str, vocab_path: str, device: str = "cpu", max_new_tokens: int = 64):
        self.device = torch.device(device)
        self.tokenizer = SimpleTokenizer.load(vocab_path)

        ckpt = torch.load(checkpoint_path, map_location=self.device)
        vocab_size = ckpt.get("vocab_size")
        seq_len = ckpt.get("seq_len", 128)

        self.model = SimpleCausalTransformer(vocab_size=vocab_size, max_seq_len=seq_len)
        self.model.load_state_dict(ckpt["model_state_dict"])
        self.model.to(self.device)
        self.model.eval()
        self.max_new_tokens = max_new_tokens

    def generate(self, prompt: str, session_history: List[dict]) -> str:
        ids = self.tokenizer.encode(prompt, add_bos=True, add_eos=False)
        input_ids = torch.tensor(ids, dtype=torch.long, device=self.device).unsqueeze(0)

        with torch.no_grad():
            for _ in range(self.max_new_tokens):
                logits = self.model(input_ids)
                next_logits = logits[:, -1, :]
                next_id = int(torch.argmax(next_logits, dim=-1).item())
                if next_id == self.tokenizer.vocab.get(self.tokenizer.EOS):
                    break
                next_id_t = torch.tensor([[next_id]], dtype=torch.long, device=self.device)
                input_ids = torch.cat([input_ids, next_id_t], dim=1)

        output_ids = input_ids.squeeze(0).cpu().tolist()
        return self.tokenizer.decode(output_ids)
