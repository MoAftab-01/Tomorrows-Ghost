"""Small deterministic evidence layer for synthetic fixtures."""
import os

FIXTURE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic")


def _load_fixtures():
    fixtures = {}
    try:
        for entry in os.listdir(FIXTURE_DIR):
            if entry.endswith(".md") and not entry.startswith("."):
                path = os.path.join(FIXTURE_DIR, entry)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        fixtures[entry] = f.read()
                except Exception:
                    pass
    except Exception:
        pass
    return fixtures


def _fixture_memory_text(name: str, fixtures: dict = None) -> str:
    if fixtures is None:
        fixtures = _load_fixtures()
    text = fixtures.get(name, "")
    lines = text.split("\n")
    # Take the paragraph that is the actual memory content (after front-matter, before evidence citation / note)
    content_lines = []
    for ln in lines:
        ln = ln.strip()
        if ln.startswith("---") or ln.startswith("fixture_id:") or ln.startswith("year:") or ln.startswith("source:") or ln.startswith("privacy:") or ln.startswith("Evidence citation:") or ln.startswith("Note:"):
            continue
        if ln == "":
            continue
        content_lines.append(ln)
    return " ".join(content_lines)[:280]


def select_evidence(query: str, fixtures: dict = None):
    if fixtures is None:
        fixtures = _load_fixtures()
    if not fixtures:
        return []
    query_lo = query.lower()
    refs = []
    # Determine if this is clearly unrelated to 2016 memory content
    unrelated_keywords = ["pet", "dog", "cat", "favorite food", "favorite color", "favorite movie", "quantum physics", "car", "house address"]
    clearly_unrelated = any(w in query_lo for w in unrelated_keywords)
    # Direct factual claims (explicit in source) -> supported
    direct_factors = [w for w in ["future", "loneliness", "certainty", "clarity", "questions", "belief", "technology", "wrote"] if w in query_lo]
    # Interpretive / inferred emotions, fears, motivations -> partial (not direct)
    interpretive_factors = [w for w in ["fear", "afraid", "emotion", "felt", "motivated", "desire", "hope"] if w in query_lo]
    fixture_file = "fixture_memory_2016.md"
    fixture_text = fixtures.get(fixture_file, "")
    if clearly_unrelated:
        return [{
            "source": f"synthetic/{fixture_file}",
            "excerpt": _fixture_memory_text(fixture_file, fixtures),
            "status": "insufficient",
        }]
    # Distinguish direct factual support from interpretive support
    if direct_factors and not interpretive_factors:
        # Direct claim explicitly stated in fixture -> supported
        refs.append({
            "source": f"synthetic/{fixture_file}",
            "excerpt": _fixture_memory_text(fixture_file, fixtures),
            "status": "supported",
        })
    elif interpretive_factors or any(w in query_lo for w in ["2016", "believe", "feel", "thought", "wrote", "memory"]):
        # Inferred emotion/fear/motivation -> partial (fixture provides context, not explicit claim)
        refs.append({
            "source": f"synthetic/{fixture_file}",
            "excerpt": _fixture_memory_text(fixture_file, fixtures),
            "status": "partial",
        })
    else:
        refs.append({
            "source": f"synthetic/{fixture_file}",
            "excerpt": _fixture_memory_text(fixture_file, fixtures),
            "status": "partial",
        })
    # Deduplicate
    seen = set()
    unique = []
    for r in refs:
        if r["source"] not in seen:
            seen.add(r["source"])
            unique.append(r)
    return unique[:3]
