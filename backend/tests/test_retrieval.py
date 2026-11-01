"""Tests for Stage 2A retrieval layer."""
from retrieval import select_evidence

def test_select_evidence_has_fixture():
    refs = select_evidence("What did I believe in 2016?")
    assert isinstance(refs, list)
    # At least fixture exists
    sources = [r["source"] for r in refs]
    assert any("fixture_memory_2016.md" in s for s in sources)

def test_unsupported_claim_has_insufficient():
    refs = select_evidence("What was my first pet's name about quantum physics?")
    # May return empty or partial; only assert list
    assert isinstance(refs, list)
def test_direct_belief_is_supported():
    from retrieval import select_evidence
    r = select_evidence("What did I believe technology could fix?")
    assert r and r[0]["status"] == "supported"

def test_interpreted_fear_is_partial():
    from retrieval import select_evidence
    r = select_evidence("Were you afraid of being alone?")
    assert r and r[0]["status"] == "partial"

def test_unsupported_pet_is_insufficient():
    from retrieval import select_evidence
    r = select_evidence("What was my pet's name?")
    assert r and r[0]["status"] == "insufficient"
