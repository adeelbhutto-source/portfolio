"""Lett, original implementasjon av en enkel kausal transformer.

Design: enkel, lett å lese, ment for små eksperimenter og som referanseimplementasjon.
"""
from typing import Optional

import torch
import torch.nn as nn


class SimpleCausalTransformer(nn.Module):
    def __init__(
        self,
        vocab_size: int,
        emb_size: int = 128,
        nhead: int = 4,
        num_layers: int = 2,
        dim_feedforward: int = 512,
        max_seq_len: int = 128,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.token_emb = nn.Embedding(vocab_size, emb_size)
        self.pos_emb = nn.Embedding(max_seq_len, emb_size)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=emb_size, nhead=nhead, dim_feedforward=dim_feedforward, dropout=dropout
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.ln = nn.LayerNorm(emb_size)
        self.out = nn.Linear(emb_size, vocab_size)

        self.max_seq_len = max_seq_len

    def forward(self, input_ids: torch.Tensor) -> torch.Tensor:
        """Forward pass.

        Args:
            input_ids: LongTensor shape (batch, seq_len)

        Returns:
            logits: FloatTensor shape (batch, seq_len, vocab_size)
        """
        b, s = input_ids.size()
        positions = torch.arange(s, device=input_ids.device).unsqueeze(0).expand(b, s)

        x = self.token_emb(input_ids) + self.pos_emb(positions)
        # transformer expects (seq_len, batch, embed)
        x = x.transpose(0, 1)

        # causal mask: prevent attending to future tokens
        mask = torch.triu(torch.full((s, s), float("-inf"), device=input_ids.device), diagonal=1)

        x = self.transformer(x, mask=mask)
        x = x.transpose(0, 1)
        x = self.ln(x)
        logits = self.out(x)
        return logits
