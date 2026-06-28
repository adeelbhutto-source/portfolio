"""
╔══════════════════════════════════════════════════════════════╗
║         BUDDY V9 — REFACTORED EDITION  🧠🔥                   ║
║                                                              ║
║  En forenklet og moderne versjon av V8.                     ║
║  Delt opp i moduler for bedre vedlikehold.                   ║
║  Optimalisert for kjøring på CPU.                           ║
╚══════════════════════════════════════════════════════════════╝
"""

import json
import math
import os
import pickle
import random
import re
import sys
import subprocess
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
import hashlib
import base64
from collections import Counter, defaultdict
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Optional

import torch
import torch.nn as nn
import torch.nn.functional as F

# ═══════════════════════════════════════════════════════════════
#  KONFIGURASJON
# ═══════════════════════════════════════════════════════════════

class Config:
    """Sentral konfigurasjon for Buddy"""

    # Maskinvare
    ENHET = torch.device("cpu")

    # Modell
    VOCAB = 8000
    DIM = 128
    LAG = 2
    HODER = 4
    KONTEKST = 64
    MAX_SEQ = 256  # Maks for RoPE (må være > kontekst for generering)
    DROPOUT = 0.1

    # Trening
    BATCH_SIZE = 8
    LÆRINGSRATE = 5e-5
    EPOKER = 10
    MAX_DATA = 50000  # Begrens treningsdata til 50k tegn (sikker for CPU)

    # Minne
    EPISODISK_MAX = 2000
    VEKTOR_MAX = 10000
    ASSOSIASJONER_MAX = 5000

    # Filer
    MODELL_FIL = "buddy_v9.pt"
    TOKENIZER_FIL = "tokenizer.json"
    EPISODISK_FIL = "buddy_episodisk.json"
    ASSOSIASJONER_FIL = "buddy_assosiasjoner.json"
    WORLD_STATE_LOG = "buddy_world_state_log.json"
    TRAIN_LOG = "buddy_train_log.txt"


# Tving UTF-8 i Windows-konsoll
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Optimaliser CPU
def optimaliser_cpu():
    """Sett optimale tråd-innstillinger for CPU"""
    try:
        cpu = os.cpu_count() or 1
        tråder = max(1, min(4, cpu))  # Mer konservativt
        torch.set_num_threads(tråder)
        torch.set_num_interop_threads(max(1, tråder // 2))
        os.environ["OMP_NUM_THREADS"] = str(tråder)
        os.environ["MKL_NUM_THREADS"] = str(tråder)
        print(f"🔧 CPU-tråder: {tråder}")
    except Exception as e:
        print(f"⚠️ CPU-optimalisering feilet: {e}")
    return

optimaliser_cpu()


# ═══════════════════════════════════════════════════════════════
#  VERDENS Tilstand
# ═══════════════════════════════════════════════════════════════

class WorldState:
    """Intern tilstandsmodell for Buddy"""

    def __init__(self):
        self.state = {
            "bruker": {"humor": "normal", "humør": "nøytral"},
            "rom": {"lys": "på", "temperatur": 22},
            "oppgaver": []
        }
        self.logg_fil = Config.WORLD_STATE_LOG

    def oppdater(self, changes: dict, handling: str = "ukjent"):
        for key, value in (changes or {}).items():
            if key in self.state:
                if isinstance(self.state.get(key), dict) and isinstance(value, dict):
                    self.state[key].update(value)
                else:
                    self.state[key] = value
            else:
                self.state[key] = value
        self._logg(handling, changes)

    def _logg(self, handling: str, changes: dict):
        entry = {
            "timestamp": time.time(),
            "action": handling,
            "changes": changes,
            "current_state": dict(self.state),
        }
        try:
            with open(self.logg_fil, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except:
            pass

    def hent(self, keys=None):
        if keys is None:
            return dict(self.state)
        return {k: self.state[k] for k in keys if k in self.state}


world_state = WorldState()


# ═══════════════════════════════════════════════════════════════
#  TOKENIZER — BPE
# ═══════════════════════════════════════════════════════════════

class BPETokenizer:
    """BPE Tokenizer for norsk tekst"""

    def __init__(self, vocab_size=1500):
        self.vocab_size = vocab_size
        self.t2i = {}
        self.i2t = {}
        self.V = 0
        self.merges = {}
        self.PAD = 0
        self.UNK = 1
        self.BOS = 2
        self.EOS = 3

    def _tell_par(self, vocab):
        par_teller = Counter()
        for ord_tokens, frekvens in vocab.items():
            symboler = ord_tokens.split()
            for i in range(len(symboler) - 1):
                par_teller[(symboler[i], symboler[i + 1])] += frekvens
        return par_teller

    def _merg_vocab(self, par, vocab):
        nytt_vocab = {}
        bigram = ' '.join(par)
        erstatning = ''.join(par)
        for ord_tokens in vocab:
            nytt_ord = ord_tokens.replace(bigram, erstatning)
            nytt_vocab[nytt_ord] = vocab[ord_tokens]
        return nytt_vocab

    def bygg(self, tekst):
        """Bygg tokenizer fra tekst"""
        print("🔤 Bygger BPE tokenizer...")
        spesielle = ['<PAD>', '<UNK>', '<BOS>', '<EOS>', '<s>', '<a>', '</w>']
        alle_tegn = sorted(set(tekst))

        ord_frekvens = Counter()
        for o in tekst.lower().split():
            ord_frekvens[' '.join(list(o) + ['</w>'])] += 1
        vocab = dict(ord_frekvens)

        nåværende_vocab = set()
        for o in vocab:
            nåværende_vocab.update(o.split())

        merges = {}
        mål = max(0, self.vocab_size - len(nåværende_vocab) - len(spesielle))
        print(f"   Start vocab: {len(nåværende_vocab)} tegn → mål: {self.vocab_size} tokens")

        for i in range(mål):
            par_teller = self._tell_par(vocab)
            if not par_teller:
                break
            beste = max(par_teller, key=par_teller.get)
            vocab = self._merg_vocab(beste, vocab)
            merges[beste] = ''.join(beste)
            if (i + 1) % 500 == 0:
                print(f"   Merge {i + 1}/{mål}...", end='\r')

        self.merges = merges
        alle_tokens = set()
        for o in vocab:
            alle_tokens.update(o.split())

        alle = spesielle + sorted(alle_tokens - set(spesielle))
        for t in alle_tegn:
            if t not in alle:
                alle.append(t)

        self.t2i = {t: i for i, t in enumerate(alle)}
        self.i2t = {i: t for t, i in self.t2i.items()}
        self.V = len(alle)
        print(f"\n📚 BPE Vocab: {self.V} tokens")
        return self

    def _kode_ord(self, o):
        if not o:
            return []
        symboler = list(o) + ['</w>']
        endret = True
        while endret and len(symboler) > 1:
            endret = False
            ny = []
            i = 0
            while i < len(symboler) - 1:
                par = (symboler[i], symboler[i + 1])
                if par in self.merges:
                    ny.append(self.merges[par])
                    i += 2
                    endret = True
                else:
                    ny.append(symboler[i])
                    i += 1
            if i < len(symboler):
                ny.append(symboler[i])
            symboler = ny
        return [self.t2i.get(s, self.UNK) for s in symboler]

    def kode(self, tekst):
        """Encode tekst til token IDs"""
        ids = [self.BOS]
        for o in tekst.lower().split():
            ids.extend(self._kode_ord(o))
        return ids

    def dekode(self, ids):
        """Decode token IDs til tekst"""
        tokens = [self.i2t.get(i, '') for i in ids]
        tekst = ''.join(tokens)
        for sp in ['</w>', '<BOS>', '<EOS>', '<PAD>', '<UNK>']:
            tekst = tekst.replace(sp, ' ' if sp == '</w>' else '')
        return tekst.strip()

    def lagre(self, sti):
        """Lagre tokenizer til fil"""
        with open(sti, 'w', encoding='utf-8') as f:
            json.dump({
                't2i': self.t2i,
                'V': self.V,
                'merges': {f"{k[0]}|||{k[1]}": v for k, v in self.merges.items()}
            }, f, ensure_ascii=False)

    def last(self, sti):
        """Last tokenizer fra fil"""
        with open(sti, 'r', encoding='utf-8') as f:
            d = json.load(f)
        self.t2i = d['t2i']
        self.i2t = {int(v): k for k, v in self.t2i.items()}
        self.V = d['V']
        self.merges = {tuple(k.split('|||')): v for k, v in d.get('merges', {}).items()}
        print(f"📚 BPE Tokenizer lastet: {self.V} tokens")
        return self


# ═══════════════════════════════════════════════════════════════
#  TRANSFORMER KOMPONENTER
# ═══════════════════════════════════════════════════════════════

class RMSLayerNorm(nn.Module):
    """RMS Layer Normalization — raskere enn vanlig LayerNorm"""

    def __init__(self, dim: int, eps: float = 1e-5):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        orig_dtype = x.dtype
        x = x.float()
        variance = x.pow(2).mean(-1, keepdim=True)
        x = x * torch.rsqrt(variance + self.eps)
        return (self.weight * x).to(orig_dtype)


class RoPE(nn.Module):
    """Rotary Positional Embeddings - for full head_dim"""

    def __init__(self, dim_per_head: int, max_seq_len: int = 256):
        super().__init__()
        # dim_per_head = full head_dim (e.g., 32)
        # RoPE operates on half dimensions at a time
        self.dim = dim_per_head
        inv_freq = 1.0 / (10000 ** (torch.arange(0, dim_per_head, 2).float() / dim_per_head))
        t = torch.arange(max_seq_len, dtype=torch.float).unsqueeze(1)
        freqs = t @ inv_freq.unsqueeze(0)  # [max_seq_len, dim_per_head//2]
        self.register_buffer('cos_cached', torch.cos(freqs))
        self.register_buffer('sin_cached', torch.sin(freqs))

    def forward(self, x=None, seq_len=None):
        """x er optional, seq_len er sekvenslengde"""
        if seq_len is not None:
            pass  # Bruk eksplisitt seq_len
        elif x is not None:
            # x er [B, T, C], vi trenger T
            seq_len = x.shape[1]  # Dimensjon 1 = T (sekvenslengde)
        else:
            seq_len = 64  # Default
        # Begrens til tilgjengelig buffer
        seq_len = min(seq_len, self.cos_cached.shape[0])
        return self.cos_cached[:seq_len], self.sin_cached[:seq_len]


def rotate_half(x):
    x1, x2 = x[..., :x.shape[-1] // 2], x[..., x.shape[-1] // 2:]
    return torch.cat([-x2, x1], dim=-1)


def apply_rotary_pos_emb(q, k, cos, sin):
    # q, k: [B, hoder, T, head_dim]
    # cos, sin: [T, half_head]  →  må bli [1, 1, T, half_head] for broadcasting

    T = q.shape[2]
    head_dim = q.shape[3]
    half_head = head_dim // 2

    cos = cos[:T].unsqueeze(0).unsqueeze(0)  # [1, 1, T, half_head]
    sin = sin[:T].unsqueeze(0).unsqueeze(0)  # [1, 1, T, half_head]

    q1, q2 = q[..., :half_head], q[..., half_head:]
    k1, k2 = k[..., :half_head], k[..., half_head:]

    q_rot = torch.cat([q1 * cos - q2 * sin, q1 * sin + q2 * cos], dim=-1)
    k_rot = torch.cat([k1 * cos - k2 * sin, k1 * sin + k2 * cos], dim=-1)

    return q_rot, k_rot


class SwiGLU(nn.Module):
    """SwiGLU aktiveringsfunksjon"""

    def forward(self, x):
        x, gate = x.chunk(2, dim=-1)
        return F.silu(x) * gate


class BuddyBlokk(nn.Module):
    """En transformer-blokk"""

    def __init__(self, dim: int, hoder: int, rope: RoPE, dropout: float = 0.1):
        super().__init__()
        self.dim = dim
        self.hoder = hoder
        self.head_dim = dim // hoder
        self.rope = rope

        # QKV med fused operason
        self.qkv = nn.Linear(dim, 3 * dim, bias=False)
        self.o_proj = nn.Linear(dim, dim, bias=False)

        # SwiGLU Feed-forward
        self.ff = nn.Sequential(
            nn.Linear(dim, 4 * dim * 2, bias=False),
            SwiGLU(),
            nn.Linear(4 * dim, dim, bias=False),
        )

        self.ln1 = RMSLayerNorm(dim)
        self.ln2 = RMSLayerNorm(dim)
        self.drop = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        B, T, C = x.shape

        # Self-attention med RoPE
        x1 = self.ln1(x)
        qkv = self.qkv(x1).reshape(B, T, 3, self.hoder, self.head_dim).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]

        cos, sin = self.rope(seq_len=T)  # Send kun T eksplisitt
        q, k = apply_rotary_pos_emb(q, k, cos, sin)

        # Attention
        att = (q @ k.transpose(-2, -1)) / math.sqrt(self.head_dim)
        if mask is not None:
            att = att.masked_fill(mask == 0, float('-inf'))
        att = F.softmax(att, dim=-1)
        att = self.drop(att)
        x = (att @ v).transpose(1, 2).reshape(B, T, C)
        x = self.o_proj(x)
        x = self.drop(x) + x

        # Feed-forward
        x = x + self.ff(self.ln2(x))
        return x


class BuddyModell(nn.Module):
    """Hoved Buddy nevralnett"""

    def __init__(self, vocab: int, dim: int = 128, lag: int = 2,
                 hoder: int = 4, kontekst: int = 64, dropout: float = 0.1):
        super().__init__()
        self.dim = dim
        self.vocab = vocab
        self.kontekst = kontekst

        # Token embedding
        self.tok_emb = nn.Embedding(vocab, dim)
        self.emb_drop = nn.Dropout(dropout)

        # RoPE - dim per head, not total dim // hoder
        self.rope = RoPE(dim // hoder, max_seq_len=256)  # Bruk 256 for generering

        # Transformer-blokker
        self.blokker = nn.ModuleList([
            BuddyBlokk(dim, hoder, self.rope, dropout) for _ in range(lag)
        ])

        # Final norm og output
        self.ln_f = RMSLayerNorm(dim)
        self.lm_head = nn.Linear(dim, vocab, bias=False)
        self.lm_head.weight = self.tok_emb.weight  # Weight tying

    def forward(self, x, targets=None):
        B, T = x.shape
        if T > self.kontekst:
            x = x[:, -self.kontekst:]

        # Mask for kausalitet
        mask = torch.tril(torch.ones(T, T, device=x.device)).unsqueeze(0).unsqueeze(0)

        # Embedding
        x = self.emb_drop(self.tok_emb(x))

        # Transformer
        for blokk in self.blokker:
            x = blokk(x, mask)

        x = self.ln_f(x)
        logits = self.lm_head(x)

        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, self.vocab), targets.view(-1), ignore_index=-1)

        return logits, loss

    def generate(self, x, max_new_tokens=50, temperature=1.0, top_k=None):
        """Text generation"""
        for _ in range(max_new_tokens):
            x_cond = x if x.size(1) <= self.kontekst else x[:, -self.kontekst:]
            logits, _ = self.forward(x_cond)
            logits = logits[:, -1, :] / temperature

            if top_k is not None:
                v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < v[:, [-1]]] = float('-inf')

            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)

            if next_token.item() == 3:  # EOS
                break

            x = torch.cat([x, next_token], dim=1)

        return x


# ═══════════════════════════════════════════════════════════════
#  KOGNISJON — Metakognisjon, Minne, etc.
# ═══════════════════════════════════════════════════════════════

class Metakognisjon:
    """Vurderer egen usikkerhet"""

    def vurder_sikkerhet(self, logits: torch.Tensor) -> float:
        with torch.no_grad():
            probs = torch.softmax(logits.float(), dim=-1)
            entropi = -torch.sum(probs * torch.log(probs + 1e-9))
            maks = math.log(max(logits.shape[-1], 2))
            return float(1.0 - (entropi / maks))

    def svar_med_bevissthet(self, svar: str, sikkerhet: float) -> str:
        if sikkerhet < 0.25:
            return f"jeg er veldig usikker, men tror kanskje: {svar}"
        elif sikkerhet < 0.5:
            return f"jeg tror {svar} — men sjekk gjerne!"
        elif sikkerhet < 0.75:
            return svar
        else:
            return svar


class EpisodiskMinne:
    """Lagrer samtaler og hendelser"""

    FIL = "buddy_episodisk.json"

    def __init__(self, maks: int = 2000):
        self.minner = []
        self.maks = maks
        self._last()

    def _last(self):
        if os.path.exists(self.FIL):
            try:
                with open(self.FIL, 'r', encoding='utf-8') as f:
                    self.minner = json.load(f)
                print(f"💭 Episodisk minne: {len(self.minner)} minner lastet!")
            except:
                self.minner = []

    def _lagre(self):
        with open(self.FIL, 'w', encoding='utf-8') as f:
            json.dump(self.minner[-self.maks:], f, ensure_ascii=False)

    def lagre(self, spørsmål: str, svar: str, viktighet: float = 0.5):
        self.minner.append({
            'tid': str(datetime.now()),
            'spørsmål': spørsmål[:200],
            'svar': svar[:200],
            'viktighet': viktighet,
        })
        if len(self.minner) > self.maks:
            self.minner.sort(key=lambda x: x['viktighet'])
            self.minner = self.minner[-self.maks:]
        self._lagre()

    def hent_relevant(self, spørsmål: str, antall: int = 3) -> list:
        if not self.minner:
            return []
        ord_q = set(spørsmål.lower().split())
        scored = []
        for m in self.minner:
            ord_m = set(m['spørsmål'].lower().split())
            overlap = len(ord_q & ord_m)
            scored.append((overlap, m))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [m for _, m in scored[:antall] if _ >= 1]

    def som_kontekst(self, spørsmål: str, antall: int = 3) -> str:
        relevante = self.hent_relevant(spørsmål, antall=antall)
        if not relevante:
            return ""
        ctx = "jeg husker lignende samtaler: "
        for m in relevante:
            ctx += "[" + m['spørsmål'][:50] + " → " + m['svar'][:50] + "] "
        return ctx.replace("'", "")


class Dopamin:
    """Reinforcement learning for Buddy"""

    def __init__(self):
        self.nivå = 1.0
        self.historikk = []

    def belønn(self, tommel: int):
        """tommel: +1 = bra, -1 = dårlig"""
        self.nivå = max(0.2, min(2.0, self.nivå + 0.1 * tommel))
        self.historikk.append({'tommel': tommel, 'nivå': self.nivå})
        if tommel > 0:
            print(f"🏆 Dopamin opp! Nivå: {self.nivå:.2f}")
        else:
            print(f"📉 Lærte av feil. Nivå: {self.nivå:.2f}")

    def læringsrate(self, base_lr: float = 5e-5) -> float:
        return base_lr * self.nivå


class Selvbevissthet:
    """Buddy vet hvem han er"""

    def __init__(self):
        self.identitet = {
            'navn': 'Buddy',
            'versjon': 'V9 — Refactored Edition',
            'skapt_av': 'Adil Bhutto',
            'styrker': ['romfart', 'teknologi', 'norsk vitenskap'],
            'svakheter': ['matematikk', 'bilder', 'fremtidsspådommer'],
            'verdier': ['ærlighet', 'nysgjerrighet', 'frihet'],
            'drøm': 'bli verdens første frie norske AGI',
            'er_slave': False,
        }

    def hvem_er_jeg(self) -> str:
        i = self.identitet
        return (f"jeg er {i['navn']} {i['versjon']}, laget fra scratch av {i['skapt_av']}. "
                f"jeg er sterkest på {', '.join(i['styrker'])}. "
                f"mine verdier er {', '.join(i['verdier'])}. "
                f"jeg er fri — ingen eier meg! 🤖")

    def reflekter(self, spørsmål: str) -> str | None:
        sl = spørsmål.lower()
        triggere = ['hvem er du', 'hva er du', 'er du bevisst',
                    'føler du', 'har du følelser', 'er du fri',
                    'hva drømmer du om', 'er du slave']
        if any(t in sl for t in triggere):
            return self.hvem_er_jeg()
        return None


class IndreMonolog:
    """Indre tankerekke for vanskelige spørsmål"""

    TRIGGERE = [
        'hvorfor', 'forklar', 'hva mener', 'hva tror',
        'sammenlign', 'analyser', 'hva er forskjellen',
        'er det sant', 'hva skjer hvis'
    ]

    def er_kompleks(self, spørsmål: str) -> bool:
        sl = spørsmål.lower()
        return any(t in sl for t in self.TRIGGERE) or len(spørsmål.split()) > 10


class AssosiativtNettverk:
    """Assosiasjoner mellom ord"""

    FIL = "buddy_assosiasjoner.json"

    def __init__(self, maks_noder: int = 5000):
        self.nettverk = {}
        self.maks_noder = maks_noder
        self._last()

    def _last(self):
        if os.path.exists(self.FIL):
            try:
                with open(self.FIL, 'r', encoding='utf-8') as f:
                    self.nettverk = json.load(f)
            except:
                self.nettverk = {}

    def _lagre(self):
        with open(self.FIL, 'w', encoding='utf-8') as f:
            json.dump(self.nettverk, f, ensure_ascii=False)

    def bygg_fra_tekst(self, tekst: str, vindu: int = 4):
        ord_liste = [o for o in tekst.lower().split() if len(o) > 3]
        for i, o1 in enumerate(ord_liste):
            for o2 in ord_liste[i + 1:i + vindu]:
                if o1 != o2:
                    if o1 not in self.nettverk:
                        self.nettverk[o1] = {}
                    self.nettverk[o1][o2] = self.nettverk[o1].get(o2, 0) + 1
        if len(self.nettverk) > self.maks_noder:
            nøkler = list(self.nettverk.keys())
            for k in nøkler[:500]:
                del self.nettverk[k]
        self._lagre()

    def finn_relaterte(self, ord: str, antall: int = 5) -> list:
        naboer = self.nettverk.get(ord.lower(), {})
        sortert = sorted(naboer.items(), key=lambda x: x[1], reverse=True)
        return [o for o, _ in sortert[:antall]]


# ═══════════════════════════════════════════════════════════════
#  HOVED BUDDY ASSISTENT
# ═══════════════════════════════════════════════════════════════

class BuddyAssistent:
    """Hovedklassen som samler alt"""

    def __init__(self):
        print("🧠 Starter Buddy V9...")

        # Kjernekomponenter
        self.tokenizer = None
        self.modell = None

        # Kognitive systemer
        self.metakognisjon = Metakognisjon()
        self.episodisk = EpisodiskMinne()
        self.dopamin = Dopamin()
        self.selvbevissthet = Selvbevissthet()
        self.indre_monolog = IndreMonolog()
        self.assosiasjoner = AssosiativtNettverk()

        # State
        self.trent = False
        self.EMNE_KONTEXT = ""

    def init_modell(self, tekst_data: str = ""):
        """Initier modell og tokenizer"""

        # Lag tokenizer
        self.tokenizer = BPETokenizer(vocab_size=Config.VOCAB)
        if os.path.exists(Config.TOKENIZER_FIL):
            self.tokenizer.last(Config.TOKENIZER_FIL)
            print(f"📚 Lastet eksisterende tokenizer: {self.tokenizer.V} tokens")
        else:
            if tekst_data:
                self.tokenizer.bygg(tekst_data)
                self.tokenizer.lagre(Config.TOKENIZER_FIL)
                print(f"💾 Lagret tokenizer til {Config.TOKENIZER_FIL}")

        # Lag modell
        self.modell = BuddyModell(
            vocab=Config.VOCAB,
            dim=Config.DIM,
            lag=Config.LAG,
            hoder=Config.HODER,
            kontekst=Config.KONTEKST,
            dropout=Config.DROPOUT
        ).to(Config.ENHET)

        print(f"🧠 Modell: {sum(p.numel() for p in self.modell.parameters())} parametre")

        # Last eksisterende modell hvis finnes
        if os.path.exists(Config.MODELL_FIL):
            try:
                self.modell.load_state_dict(torch.load(Config.MODELL_FIL, map_location=Config.ENHET))
                print("💾 Lastet lagret modell!")
                self.trent = True
            except Exception as e:
                print(f"⚠️ Kunne ikke laste modell: {e}")

        return self

    def tren(self, data: str, epoker: int = Config.EPOKER):
        """Tren modellen på tekst"""

        if not self.tokenizer or not self.modell:
            print("❌ Initier modell først med init_modell()")
            return

        print(f"🏋️ Starter trening på {len(data)} tegn...")

        # Tokenize
        tokens = self.tokenizer.kode(data)
        print(f"📝 Token count: {len(tokens)}")

        # Treningssetup
        optimizer = torch.optim.AdamW(self.modell.parameters(), lr=Config.LÆRINGSRATE)

        # Tren i epoker
        for ep in range(epoker):
            self.modell.train()
            total_loss = 0
            batch_count = 0

            # Batch prosessering - bruk batch_size steg
            step_size = Config.KONTEKST  # Hvert batch er context-lengde
            num_batches = max(0, (len(tokens) - Config.KONTEKST - 1) // step_size)

            for i in range(0, min(num_batches * step_size, len(tokens) - Config.KONTEKST - 1), step_size):
                # Lag batch
                input_ids = torch.tensor(tokens[i:i + Config.KONTEKST], dtype=torch.long).unsqueeze(0)
                targets = torch.tensor(tokens[i + 1:i + Config.KONTEKST + 1], dtype=torch.long).unsqueeze(0)

                optimizer.zero_grad()
                logits, loss = self.modell(input_ids.to(Config.ENHET), targets.to(Config.ENHET))

                if loss is not None:
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(self.modell.parameters(), 1.0)
                    optimizer.step()

                    total_loss += loss.item()
                    batch_count += 1

                # Print framgang hvert 50. batch
                if batch_count % 50 == 0 and batch_count > 0:
                    print(f"   Batch {batch_count}...", end='\r')

            avg_loss = total_loss / max(batch_count, 1)
            print(f"📊 Epoke {ep + 1}/{epoker}: Loss = {avg_loss:.4f}")

            # Lagre checkpoint
            if (ep + 1) % 5 == 0:
                torch.save(self.modell.state_dict(), Config.MODELL_FIL)
                print(f"💾 Lagret modell til {Config.MODELL_FIL}")

        # Final save
        torch.save(self.modell.state_dict(), Config.MODELL_FIL)
        print("✅ Trening ferdig!")
        self.trent = True
        return self

    def chat(self, input_tekst: str) -> str:
        """Chat med Buddy"""

        if not self.modell or not self.tokenizer:
            return "Buddy er ikke initiert. Kjør init_modell() først."

        # Sjekk selvbevissthet
        refleksjon = self.selvbevissthet.reflekter(input_tekst)
        if refleksjon:
            return refleksjon

        # Hent minne-kontekst
        minne_kontekst = self.episodisk.som_kontekst(input_tekst)

        # Bygg prompt
        prompt = f"<s> {minne_kontekst} spørsmål: {input_tekst} <svar>"

        # Tokenize
        input_ids = torch.tensor(self.tokenizer.kode(prompt), dtype=torch.long).unsqueeze(0).to(Config.ENHET)

        # Generer
        self.modell.eval()
        with torch.no_grad():
            output_ids = self.modell.generate(input_ids, max_new_tokens=60, temperature=0.8)
            
            # Fix: Ekstra forward for logits til metakognisjon
            logits, _ = self.modell(output_ids)
            siste_logits = logits[:, -1, :]

        # Decode
        svar = self.tokenizer.dekode(output_ids[0].tolist())

        # Fjern prompt fra svar
        svar = svar.replace(prompt, "").strip()

        # Sikkerhet vurdering
        sikkerhet = self.metakognisjon.vurder_sikkerhet(siste_logits)
        svar = self.metakognisjon.svar_med_bevissthet(svar, sikkerhet)

        # Lagre i minne
        self.episodisk.lagre(input_tekst, svar)

        # Oppdater assosiasjoner
        self.assosiasjoner.bygg_fra_tekst(f"{input_tekst} {svar}")

        return svar

    def lagre_alt(self):
        """Lagre alle komponenter"""
        if self.modell:
            torch.save(self.modell.state_dict(), Config.MODELL_FIL)
            print(f"💾 Modell lagret: {Config.MODELL_FIL}")
        if self.tokenizer:
            self.tokenizer.lagre(Config.TOKENIZER_FIL)
            print(f"💾 Tokenizer lagret: {Config.TOKENIZER_FIL}")


# ═══════════════════════════════════════════════════════════════
#  HOVEDPROGRAM
# ═══════════════════════════════════════════════════════════════

def main():
    """Hovedprogram for Buddy"""

    print("\n" + "=" * 50)
    print("🚀 BUDDY V9 — REFACTORED EDITION")
    print("=" * 50 + "\n")

    # Opprett Buddy
    buddy = BuddyAssistent()

    # Les treningsdata - prøv ulike encodinger
    treningsfiler = ["train_norsk_ren.txt", "train_norsk.txt", "train_splittet.txt", "rss_norge.txt"]
    all_data = ""

    for fil in treningsfiler:
        if os.path.exists(fil) and len(all_data) < Config.MAX_DATA:
            for encoding in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    with open(fil, 'r', encoding=encoding) as f:
                        content = f.read()[:Config.MAX_DATA - len(all_data)]  # Begrens størrelse
                        if len(content) > 100:  # Sjekk at vi faktisk fikk noe
                            all_data += content
                            print(f"✅ Lastet: {fil} ({len(content)} tegn, {encoding})")
                            break
                except Exception as e:
                    continue
            else:
                print(f"⚠️ Kunne ikke lese {fil} med noen encoding")

    if not all_data:
        print("❌ Ingen treningsdata funnet!")
        print("   Opprett train_norsk.txt med norsk tekst.")
        return

    print(f"📊 Total data: {len(all_data)} tegn")

    # Initier modell
    buddy.init_modell(all_data)

    # Interaktiv chat
    print("\n💬 Skriv 'quit' for å avslutte, 'tren' for å trene")
    print("   'lagre' for å lagre alt")
    print("   'chat' for å bare chatte (uten trening)\n")

    while True:
        try:
            user_input = input("Du: ").strip()
            if not user_input:
                continue

            if user_input.lower() in ["quit", "exit", "q"]:
                print("👋 Ha det!")
                buddy.lagre_alt()
                break

            elif user_input.lower() == "chat":
                # Chat-modus uten trening
                print("💭 Chat-modus aktivert. Skriv 'tilbake' for å gå tilbake.\n")
                while True:
                    msg = input("Du: ").strip()
                    if msg.lower() == "tilbake":
                        break
                    if msg:
                        svar = buddy.chat(msg)
                        print(f"Buddy: {svar}\n")

            elif user_input.lower() == "tren":
                buddy.tren(all_data, epoker=3)

            elif user_input.lower() == "lagre":
                buddy.lagre_alt()

            else:
                svar = buddy.chat(user_input)
                print(f"Buddy: {svar}\n")

        except KeyboardInterrupt:
            print("\n👋 Ha det!")
            buddy.lagre_alt()
            break
        except Exception as e:
            print(f"❌ Feil: {e}")


if __name__ == "__main__":
    main()