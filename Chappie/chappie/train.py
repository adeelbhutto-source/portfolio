"""Enkel trenings‑pipeline for små eksperimenter.

Merk: Dette er en referanseimplementasjon — stor trening på store datasett krever
optimert kode, distribuert trening og riktig infrastruktur.
"""
import argparse
import json
import os

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import Dataset, DataLoader
except Exception as e:
    raise RuntimeError("PyTorch er påkrevd for å trene. Installer torch og prøv igjen.") from e

from .model import SimpleCausalTransformer


class JsonlDataset(Dataset):
    def __init__(self, path: str):
        self.seqs = []
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                obj = json.loads(line)
                self.seqs.append(obj["input_ids"])

    def __len__(self):
        return len(self.seqs)

    def __getitem__(self, idx):
        import torch

        return torch.tensor(self.seqs[idx], dtype=torch.long)


def collate_fn(batch):
    import torch

    max_len = max(x.size(0) for x in batch)
    out = torch.full((len(batch), max_len), fill_value=0, dtype=torch.long)
    for i, x in enumerate(batch):
        out[i, : x.size(0)] = x
    return out


def train(
    data_path: str,
    vocab_size: int,
    out_dir: str,
    epochs: int = 1,
    batch_size: int = 16,
    lr: float = 1e-4,
    device: str = "cpu",
    seq_len: int = 128,
):
    device = torch.device(device)
    ds = JsonlDataset(data_path)
    dl = DataLoader(ds, batch_size=batch_size, shuffle=True, collate_fn=collate_fn)

    model = SimpleCausalTransformer(vocab_size=vocab_size, max_seq_len=seq_len)
    model.to(device)

    optim = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss(ignore_index=0)

    os.makedirs(out_dir, exist_ok=True)

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        n_tokens = 0
        for batch in dl:
            batch = batch.to(device)
            logits = model(batch)
            # predict next token
            shift_logits = logits[:, :-1, :].contiguous()
            shift_labels = batch[:, 1:].contiguous()
            loss = criterion(shift_logits.view(-1, shift_logits.size(-1)), shift_labels.view(-1))
            optim.zero_grad()
            loss.backward()
            optim.step()

            total_loss += loss.item() * shift_labels.numel()
            n_tokens += shift_labels.numel()

        ppl = torch.exp(torch.tensor(total_loss / max(1, n_tokens)))
        ckpt = {
            "model_state_dict": model.state_dict(),
            "vocab_size": vocab_size,
            "seq_len": seq_len,
        }
        torch.save(ckpt, os.path.join(out_dir, f"ckpt_epoch{epoch}.pt"))
        print(f"Epoch {epoch} — ppl={ppl.item():.3f}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--data", default="data/train.jsonl")
    p.add_argument("--vocab_size", type=int, required=True)
    p.add_argument("--out_dir", default="models")
    p.add_argument("--epochs", type=int, default=1)
    p.add_argument("--batch_size", type=int, default=8)
    p.add_argument("--lr", type=float, default=1e-4)
    p.add_argument("--device", default="cpu")
    p.add_argument("--seq_len", type=int, default=128)
    args = p.parse_args()

    train(
        args.data,
        vocab_size=args.vocab_size,
        out_dir=args.out_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        device=args.device,
        seq_len=args.seq_len,
    )
