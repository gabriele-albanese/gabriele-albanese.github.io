"""
Intelligence Hub — fetch e scoring RSS
Gira via GitHub Actions ogni 6 ore.
Scrive news-data.json nella root del repo.
"""

import feedparser
import json
import hashlib
import socket
import re
import time
import os
from datetime import datetime, timezone

socket.setdefaulttimeout(12)

feedparser.USER_AGENT = (
    "GabrieleAlbanese-IntelligenceHub/1.0 "
    "+https://gabriele-albanese.github.io"
)

SOURCES = [
    # AI & LLM
    {"url": "https://www.technologyreview.com/feed/",                    "topic": "ai",       "label": "MIT Technology Review"},
    {"url": "https://venturebeat.com/category/ai/feed/",                 "topic": "ai",       "label": "VentureBeat"},
    {"url": "https://openai.com/blog/rss.xml",                           "topic": "ai",       "label": "OpenAI Blog"},
    {"url": "https://blog.google/technology/ai/rss/",                    "topic": "ai",       "label": "Google AI Blog"},
    # Tech & Innovazione
    {"url": "https://www.wired.com/feed/rss",                            "topic": "tech",     "label": "Wired"},
    {"url": "https://feeds.arstechnica.com/arstechnica/index",           "topic": "tech",     "label": "Ars Technica"},
    {"url": "https://www.ben-evans.com/benedictevans?format=rss",        "topic": "tech",     "label": "Benedict Evans"},
    {"url": "https://techcrunch.com/feed/",                              "topic": "tech",     "label": "TechCrunch"},
    {"url": "https://spectrum.ieee.org/feeds/feed.rss",                  "topic": "tech",     "label": "IEEE Spectrum"},
    # Product Management
    {"url": "https://www.lennysnewsletter.com/feed",                     "topic": "pm",       "label": "Lenny's Newsletter"},
    {"url": "https://www.mindtheproduct.com/feed/",                      "topic": "pm",       "label": "Mind the Product"},
    {"url": "https://productcoalition.com/feed",                         "topic": "pm",       "label": "Product Coalition"},
    {"url": "https://www.producttalk.org/feed/",                         "topic": "pm",       "label": "Product Talk"},
    # Business & Leadership
    {"url": "https://www.mckinsey.com/rss",                              "topic": "business", "label": "McKinsey"},
    {"url": "https://sloanreview.mit.edu/feed/",                         "topic": "business", "label": "MIT Sloan Review"},
]

ALLOWLIST = [
    # AI / LLM
    "artificial intelligence", "machine learning", "large language model", "llm",
    "gpt", "claude", "gemini", "openai", "anthropic", "neural network",
    "ai model", "chatbot", "generative ai", "foundation model", "ai agent",
    "prompt engineering", "rag", "fine-tuning", "deep learning",
    # Product Management
    "product manager", "product management", "product strategy", "roadmap",
    "user research", "okr", "kpi", "backlog", "product discovery",
    "go-to-market", "gtm", "stakeholder", "mvp", "minimum viable",
    "product-led", "user story", "jobs to be done", "jtbd", "prioritization",
    # Tech & innovazione
    "startup", "saas", "platform", "data analytics", "cloud computing",
    "digital transformation", "software engineering", "tech industry",
    "venture capital", "api economy", "developer tools",
    # Business & leadership
    "business strategy", "revenue growth", "market share", "competitive advantage",
    "leadership", "management", "enterprise", "b2b", "scaling",
    "organizational", "executive", "ceo", "cto", "chief product",
    # Nuovi corsi gratuiti (rileva annunci da IBM, Google, Anthropic, Atlassian, ecc.)
    "free course", "free certification", "free training", "launch course",
    "new course", "learn for free", "free certificate", "free badge",
    "ibm training", "google learning", "anthropic learn", "atlassian university",
]

BLOCKLIST = [
    "recipe", "cooking", "food review", "restaurant review",
    "fashion week", "celebrity", "gossip",
    "match recap", "football score", "nba game", "nfl score", "soccer",
    "movie review", "album review", "music video",
    "weight loss", "diet plan", "fitness routine",
    "real estate deal", "housing market", "mortgage rate",
    "crime report", "arrest", "police",
]


def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", " ", text).strip()


def score_article(title: str, summary: str) -> int:
    text = (title + " " + summary).lower()

    for bad in BLOCKLIST:
        if bad in text:
            return 0

    score = 3  # baseline: fonte elite
    for good in ALLOWLIST:
        if good in text:
            score += 1
            if score >= 10:
                break

    return min(score, 10)


def parse_date(entry):
    parsed = entry.get("published_parsed") or entry.get("updated_parsed")
    if parsed:
        try:
            dt = datetime(*parsed[:6], tzinfo=timezone.utc)
            return dt.isoformat(), dt.strftime("%d %b %Y")
        except Exception:
            pass
    return datetime.now(timezone.utc).isoformat(), "Recente"


def fetch_source(source: dict) -> list:
    try:
        feed = feedparser.parse(source["url"])
        if feed.bozo and not feed.entries:
            return []

        articles = []
        for entry in feed.entries[:12]:
            title = entry.get("title", "").strip()
            link = entry.get("link", "").strip()
            if not title or not link:
                continue

            raw_summary = (
                entry.get("summary")
                or entry.get("description")
                or entry.get("content", [{}])[0].get("value", "")
            )
            summary = strip_html(raw_summary)[:400]

            score = score_article(title, summary)
            if score < 4:
                continue

            timestamp, date_str = parse_date(entry)
            uid = hashlib.md5(link.encode()).hexdigest()[:10]

            articles.append({
                "id": uid,
                "title": title,
                "url": link,
                "summary": summary[:280],
                "source": source["label"],
                "topic": source["topic"],
                "date": date_str,
                "timestamp": timestamp,
                "score": score,
            })

        return articles

    except Exception as exc:
        print(f"  [SKIP] {source['label']}: {exc}")
        return []


def main():
    # Carica file esistente per rolling window
    existing = []
    existing_ids = set()
    output_path = os.path.join(os.path.dirname(__file__), "..", "news-data.json")
    output_path = os.path.normpath(output_path)

    if os.path.exists(output_path):
        try:
            with open(output_path, encoding="utf-8") as f:
                data = json.load(f)
            existing = data.get("articles", [])
            existing_ids = {a["id"] for a in existing}
            print(f"Caricati {len(existing)} articoli esistenti")
        except Exception:
            pass

    # Fetch nuovi articoli
    new_articles = []
    for source in SOURCES:
        print(f"Fetch: {source['label']} ...")
        arts = fetch_source(source)
        for a in arts:
            if a["id"] not in existing_ids:
                new_articles.append(a)
                existing_ids.add(a["id"])
        time.sleep(1)

    print(f"Nuovi articoli trovati: {len(new_articles)}")

    # Merge e sort — nessuna scadenza, rolling window ampio
    all_articles = new_articles + existing
    all_articles.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    all_articles = all_articles[:200]

    output = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "count": len(all_articles),
        "articles": all_articles,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Scritti {len(all_articles)} articoli in {output_path}")


if __name__ == "__main__":
    main()
