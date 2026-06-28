import json
import os
from datetime import datetime
from collections import Counter, defaultdict

ACTION_LOG = "buddy_action_log.json"
VECTOR_DB = "buddy_vektordatabase.json"
CORE_OUT = "buddy_core_knowledge.json"
ARCHIVE_OUT = "buddy_archive.json"
REPORT_OUT = "buddy_consolidation_report.txt"
DREAM_GRAPH_OUT = "buddy_dream_graph.json"
MAX_ACTIONS = 500


def load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def normalize_fact(text: str) -> str:
    t = (text or "").strip()
    return t.lower()


def main():
    actions = load_json(ACTION_LOG, [])
    vect = load_json(VECTOR_DB, [])
    if not isinstance(actions, list):
        actions = []
    if not isinstance(vect, list):
        vect = []

    recent_actions = actions[-MAX_ACTIONS:]

    # 1) Destillering av sannheter fra actions (SAVE, SEARCH hits)
    fact_counter = Counter()
    for a in recent_actions:
        for act in a.get("actions", []):
            kind = act.get("kind")
            payload = act.get("payload", "")
            if kind == "SAVE" and payload:
                fact_counter[normalize_fact(payload)] += 1

    # 2) Støy-fjerning: filtrer bort tomme / korte / trivielle tekstbiter i vektordb
    cleaned_vect = []
    archived = []
    for v in vect:
        tekst = (v.get("tekst") or "").strip()
        if not tekst or len(tekst) < 20:
            archived.append(v)
            continue
        if tekst.lower() in ("hei", "hallo", "ok", "takk"):
            archived.append(v)
            continue
        cleaned_vect.append(v)

    # 3) Importance score (simpelt): høyere hvis ofte lagret som fact
    core = load_json(CORE_OUT, {"facts": [], "updated": ""})
    facts = core.get("facts", [])
    fact_map = {f.get("text"): f for f in facts}

    for fact, count in fact_counter.items():
        if fact in fact_map:
            fact_map[fact]["count"] += count
            fact_map[fact]["importance"] = min(1.0, fact_map[fact]["importance"] + 0.05 * count)
        else:
            fact_map[fact] = {
                "text": fact,
                "count": count,
                "importance": min(1.0, 0.1 * count),
            }

    facts = list(fact_map.values())
    facts.sort(key=lambda x: (-x.get("importance", 0.0), -x.get("count", 0)))
    core = {
        "updated": str(datetime.now()),
        "facts": facts[:200],
    }

    # 3b) Drømme-graph: co-occurrence i THOUGHT + spørsmål
    dream_nodes = facts[:5]
    keywords = [f.get("text") for f in dream_nodes if f.get("text")]
    rel_counter = defaultdict(int)
    for entry in recent_actions:
        parts = []
        spør = (entry.get("spørsmål") or "").lower()
        if spør:
            parts.append(spør)
        for act in entry.get("actions", []):
            if act.get("kind") == "THOUGHT":
                payload = (act.get("payload") or "").lower()
                if payload:
                    parts.append(payload)
        blob = " ".join(parts)
        present = [k for k in keywords if k and k.lower() in blob]
        for i in range(len(present)):
            for j in range(i + 1, len(present)):
                a = present[i].lower()
                b = present[j].lower()
                rel_counter[(a, b)] += 1

    nodes_out = []
    for fct in dream_nodes:
        t = (fct.get("text") or "").strip()
        if t:
            nodes_out.append({
                "text": t,
                "importance": float(fct.get("importance", 0.3)),
            })
    links_out = []
    for (a, b), w in rel_counter.items():
        if w > 0:
            links_out.append({"source": a, "target": b, "weight": w})

    # 4) Trend-analyse: bom-søk temaer (kognitive gap)
    gap_counter = defaultdict(int)
    for a in recent_actions:
        if a.get("reward", 0.0) <= 0:
            for act in a.get("actions", []):
                if act.get("kind") == "SEARCH":
                    q = (act.get("payload") or "").lower()
                    if "vær" in q or "tid" in q or "dato" in q:
                        gap_counter["Sanntidsinfo"] += 1
                    elif "navn" in q or "liker" in q or "bor" in q:
                        gap_counter["Personlig info"] += 1
                    else:
                        gap_counter["Annet"] += 1

    # Save outputs
    save_json(CORE_OUT, core)
    save_json(ARCHIVE_OUT, archived)
    save_json(VECTOR_DB, cleaned_vect)
    save_json(DREAM_GRAPH_OUT, {
        "updated": str(datetime.now()),
        "nodes": nodes_out,
        "links": links_out,
    })

    # Report
    lines = []
    lines.append("🛌 BUDDY SØVN-RAPPORT")
    lines.append(f"Tid: {datetime.now()}")
    lines.append(f"Facts lagret: {len(core['facts'])}")
    lines.append(f"Vektordb renset: {len(vect)} → {len(cleaned_vect)}")
    if gap_counter:
        lines.append("Kognitive gap:")
        for k, v in sorted(gap_counter.items(), key=lambda kv: kv[1], reverse=True):
            lines.append(f"- {k}: {v}")
    # Drømme-nøkkelord (topp-fakta fra konsolidering)
    lines.append("Drømme-nøkkelord:")
    for f in facts[:5]:
        t = (f.get("text") or "").strip()
        if t:
            lines.append(f"- {t}")
    with open(REPORT_OUT, "w", encoding="utf-8") as f:
        f.write("\\n".join(lines))

    print("Ferdig: buddy_consolidate.py")
    print(f"- {CORE_OUT}")
    print(f"- {ARCHIVE_OUT}")
    print(f"- {REPORT_OUT}")


if __name__ == "__main__":
    main()
