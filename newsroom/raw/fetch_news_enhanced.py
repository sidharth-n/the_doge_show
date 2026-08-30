#!/usr/bin/env python3
import json
import subprocess
import sys
import re
from datetime import datetime
from urllib.request import urlopen
from urllib.error import URLError
import xml.etree.ElementTree as ET

# Load existing data
with open('2026-08-30.json', 'r') as f:
    data = json.load(f)

# Helper function
def fetch_url(url):
    try:
        with urlopen(url, timeout=10) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        return None

def parse_rss(xml_str, source_name):
    items = []
    if not xml_str:
        return items
    try:
        root = ET.fromstring(xml_str)
        for item in root.findall('.//item') + root.findall('.//{http://www.w3.org/2005/Atom}entry'):
            title_elem = item.find('title')
            if title_elem is None:
                title_elem = item.find('{http://www.w3.org/2005/Atom}title')
            link_elem = item.find('link')
            if link_elem is None:
                link_elem = item.find('{http://www.w3.org/2005/Atom}link')
            desc_elem = item.find('description')
            if desc_elem is None:
                desc_elem = item.find('{http://www.w3.org/2005/Atom}summary')
            pub_elem = item.find('pubDate')
            if pub_elem is None:
                pub_elem = item.find('{http://www.w3.org/2005/Atom}published')
            
            title = (title_elem.text if title_elem is not None else "").strip()
            link = link_elem.text if (link_elem is not None and hasattr(link_elem, 'text')) else ""
            if link_elem is not None and link_elem.get('href'):
                link = link_elem.get('href')
            desc = (desc_elem.text if desc_elem is not None else "").strip()[:300]
            pub = (pub_elem.text if pub_elem is not None else "")
            
            if title and link:
                items.append({
                    "source": source_name,
                    "url": link,
                    "title": title,
                    "snippet_or_text": desc,
                    "author": "",
                    "published": pub,
                    "engagement": 0
                })
    except Exception as e:
        pass
    return items

# === ENHANCED CRYPTO ===
print("Fetching additional CRYPTO news...", file=sys.stderr)

crypto_feeds = {
    "CoinDesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
}

for name, url in crypto_feeds.items():
    rss_content = fetch_url(url)
    if rss_content:
        new_items = parse_rss(rss_content, name)
        data["crypto"].extend(new_items)
        print(f"  Added {len(new_items)} items from {name}", file=sys.stderr)

# Fetch Cointelegraph HTML and extract links
print("Fetching Cointelegraph headlines...", file=sys.stderr)
ct_html = fetch_url("https://cointelegraph.com/")
if ct_html:
    # Extract recent article links from HTML
    for match in re.finditer(r'href=["\']([^"\']*article[^"\']*)["\']|<h3[^>]*>([^<]{20,150})</h3>', ct_html[:100000]):
        url = match.group(1) if match.group(1) else ""
        title = match.group(2) if match.group(2) else ""
        if title and ("bitcoin" in title.lower() or "crypto" in title.lower() or "ethereum" in title.lower()):
            data["crypto"].append({
                "source": "Cointelegraph",
                "url": url if url.startswith('http') else f"https://cointelegraph.com{url}",
                "title": title[:120],
                "snippet_or_text": title,
                "author": "",
                "published": "",
                "engagement": 0
            })

# === ENHANCED VENICE ===
print("Fetching Venice AI news...", file=sys.stderr)

# Try direct fetch from Venice sites and news mentions
venice_searches = [
    ("Venice API", "https://venetiaapi.io/ OR site:github.com venice"),
    ("Erik Voorhees", "@ErikVoorhees Venice"),
    ("MiniMax H3", "MiniMax H3 Max Venice")
]

# Fetch Venice blog and homepage
venice_blog = fetch_url("https://venice.ai/blog")
if venice_blog:
    for match in re.finditer(r'<h2[^>]*>([^<]{20,150})</h2>|<title>([^<]{20,150})</title>', venice_blog[:50000]):
        title = match.group(1) or match.group(2)
        if title and len(title) > 5:
            data["venice"].append({
                "source": "Venice Blog",
                "url": "https://venice.ai/blog",
                "title": title[:120],
                "snippet_or_text": title,
                "author": "",
                "published": "",
                "engagement": 0
            })

# === AGENT-REACH X SEARCHES ===
print("Using agent-reach for X searches...", file=sys.stderr)

# Try using agent-reach skill approach
search_queries = [
    ("Venice AI", "data", "venice"),
    ("Erik Voorhees", "data", "voorhees"),
    ("MiniMax H3 Max", "data", "minimax")
]

for query, bucket, slug in search_queries:
    try:
        # Use twitter-cli if available
        result = subprocess.run(
            f"twitter-cli search '{query}' -n 5 2>/dev/null",
            shell=True, capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0 and result.stdout:
            lines = result.stdout.strip().split('\n')
            for line in lines[:5]:
                if line.strip() and len(line) > 10:
                    data["venice" if bucket == "data" else bucket].append({
                        "source": f"X Search ({query})",
                        "url": "",
                        "title": line[:150],
                        "snippet_or_text": line,
                        "author": "",
                        "published": "",
                        "engagement": 0
                    })
    except Exception as e:
        pass

# === AGENT-REACH REDDIT ===
print("Using agent-reach for Reddit...", file=sys.stderr)

reddit_queries = [
    ("r/artificial", "ai"),
    ("r/CryptoCurrency", "crypto"),
    ("r/dogecoin", "crypto")
]

for subreddit, target_bucket in reddit_queries:
    try:
        sub_name = subreddit.split('/')[-1]
        result = subprocess.run(
            f"opencli reddit subreddit -s {sub_name} -f json 2>/dev/null | head -100",
            shell=True, capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0 and result.stdout:
            # Try parsing as JSON
            try:
                items = json.loads(result.stdout)
                if isinstance(items, list):
                    for item in items[:5]:
                        title = item.get('title') or item.get('name') or str(item)[:100]
                        if title:
                            data[target_bucket].append({
                                "source": f"Reddit {subreddit}",
                                "url": item.get('url', ''),
                                "title": title[:150],
                                "snippet_or_text": item.get('selftext', '')[:300] or title,
                                "author": item.get('author', ''),
                                "published": "",
                                "engagement": item.get('score', 0)
                            })
            except:
                # Fallback: parse text output
                for line in result.stdout.split('\n')[:10]:
                    if line.strip() and len(line) > 10:
                        data[target_bucket].append({
                            "source": f"Reddit {subreddit}",
                            "url": "",
                            "title": line[:150],
                            "snippet_or_text": line,
                            "author": "",
                            "published": "",
                            "engagement": 0
                        })
    except Exception as e:
        pass

# === DEDUP ===
for bucket in ["venice", "ai", "crypto"]:
    seen = {}
    unique = []
    for item in data[bucket]:
        key = (item.get('title', ''), item.get('url', ''))
        if key not in seen:
            seen[key] = True
            unique.append(item)
    data[bucket] = unique[:50]  # Keep top 50 per bucket

# Save
with open('2026-08-30.json', 'w') as f:
    json.dump(data, f, indent=2)

print(json.dumps({
    "venice": len(data["venice"]),
    "ai": len(data["ai"]),
    "crypto": len(data["crypto"]),
    "prices": len(data["prices"])
}, indent=2), file=sys.stderr)
