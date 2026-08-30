#!/usr/bin/env python3
import json
import subprocess
import sys
import re
from datetime import datetime, timedelta
from urllib.request import urlopen
from urllib.error import URLError
import xml.etree.ElementTree as ET

# Initialize data structure
data = {
    "fetched_at": datetime.utcnow().isoformat() + "Z",
    "venice": [],
    "ai": [],
    "crypto": [],
    "prices": [],
    "failures": []
}

# Helper function to fetch URL
def fetch_url(url):
    try:
        with urlopen(url, timeout=10) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        return None

# Helper to parse RSS
def parse_rss(xml_str, source_name):
    items = []
    if not xml_str:
        data["failures"].append(f"RSS fetch failed: {source_name}")
        return items
    
    try:
        root = ET.fromstring(xml_str)
        # Handle both RSS and Atom namespaces
        for item in root.findall('.//item') + root.findall('.//{http://www.w3.org/2005/Atom}entry'):
            title_elem = item.find('title') or item.find('{http://www.w3.org/2005/Atom}title')
            link_elem = item.find('link') or item.find('{http://www.w3.org/2005/Atom}link')
            desc_elem = item.find('description') or item.find('{http://www.w3.org/2005/Atom}summary')
            pub_elem = item.find('pubDate') or item.find('{http://www.w3.org/2005/Atom}published')
            
            title = (title_elem.text if title_elem is not None else "").strip()
            link = link_elem.text if link_elem is not None else ""
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
        data["failures"].append(f"RSS parse error: {source_name} - {str(e)}")
    
    return items

# === VENICE ===
print("Fetching VENICE news...", file=sys.stderr)

# Venice Blog
venice_blog_html = fetch_url("https://venice.ai/blog")
if venice_blog_html:
    # Extract blog links from HTML (basic regex)
    for match in re.finditer(r'href=["\']([^"\']*blog[^"\']*)["\'].*?(?:<h|title|alt).*?([^<]{10,200})', venice_blog_html[:50000], re.DOTALL):
        url = match.group(1)
        if url.startswith('http'):
            data["venice"].append({
                "source": "Venice Blog",
                "url": url,
                "title": match.group(2)[:80] if match.group(2) else "Venice Blog Post",
                "snippet_or_text": "",
                "author": "",
                "published": "",
                "engagement": 0
            })

# Venice RSS feed (if exists)
venice_rss = fetch_url("https://venice.ai/rss")
if venice_rss:
    data["venice"].extend(parse_rss(venice_rss, "Venice RSS"))

# === AI NEWS (RSS) ===
print("Fetching AI news from RSS...", file=sys.stderr)

rss_feeds = {
    "TechCrunch AI": "https://techcrunch.com/category/artificial-intelligence/feed/",
    "The Verge AI": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    "VentureBeat AI": "https://venturebeat.com/category/ai/feed/"
}

for name, url in rss_feeds.items():
    rss_content = fetch_url(url)
    if rss_content:
        data["ai"].extend(parse_rss(rss_content, name))
    else:
        data["failures"].append(f"RSS fetch failed: {name}")

# Hacker News front page
print("Fetching Hacker News...", file=sys.stderr)
try:
    hn_data = urlopen("https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30", timeout=10).read()
    hn_json = json.loads(hn_data)
    for hit in hn_json.get("hits", [])[:20]:
        if hit.get("title"):
            data["ai"].append({
                "source": "Hacker News",
                "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                "title": hit.get("title"),
                "snippet_or_text": "",
                "author": hit.get("author", ""),
                "published": "",
                "engagement": hit.get("points", 0)
            })
except Exception as e:
    data["failures"].append(f"Hacker News error: {str(e)}")

# === CRYPTO NEWS (RSS) ===
print("Fetching CRYPTO news from RSS...", file=sys.stderr)

crypto_feeds = {
    "CoinDesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "Cointelegraph": "https://cointelegraph.com/rss",
    "The Block": "https://www.theblock.co/rss.xml",
    "Decrypt": "https://decrypt.co/feed"
}

for name, url in crypto_feeds.items():
    rss_content = fetch_url(url)
    if rss_content:
        data["crypto"].extend(parse_rss(rss_content, name))
    else:
        data["failures"].append(f"RSS fetch failed: {name}")

# === CRYPTO PRICES ===
print("Fetching crypto prices from CoinGecko...", file=sys.stderr)
try:
    markets_url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30"
    markets_data = urlopen(markets_url, timeout=10).read()
    markets_json = json.loads(markets_data)
    
    for coin in markets_json:
        if coin.get("symbol"):
            data["prices"].append({
                "symbol": coin["symbol"].upper(),
                "name": coin.get("name", ""),
                "price": coin.get("current_price", 0),
                "change_24h": coin.get("price_change_percentage_24h", 0),
                "market_cap": coin.get("market_cap", 0),
                "rank": coin.get("market_cap_rank", 0)
            })
except Exception as e:
    data["failures"].append(f"CoinGecko error: {str(e)}")

# === AGENT-REACH SEARCHES ===
print("Fetching from X/Twitter via agent-reach...", file=sys.stderr)

# Try Venice AI searches
ar_commands = [
    ("X Venice", "twitter-cli", "search -q 'Venice AI' -n 10 2>/dev/null"),
    ("X Erik Voorhees", "twitter-cli", "search -q '@ErikVoorhees' -n 10 2>/dev/null"),
    ("X MiniMax", "twitter-cli", "search -q 'MiniMax H3 Max' -n 5 2>/dev/null"),
]

for label, tool, cmd in ar_commands:
    try:
        result = subprocess.run(f"{tool} {cmd}", shell=True, capture_output=True, text=True, timeout=10)
        if result.returncode == 0 and result.stdout:
            # Parse output (format varies by CLI tool)
            lines = result.stdout.strip().split('\n')
            for line in lines[:10]:
                if line.strip():
                    # Attempt to extract tweet info
                    data["venice"].append({
                        "source": f"X ({label})",
                        "url": "",
                        "title": line[:150],
                        "snippet_or_text": line,
                        "author": "",
                        "published": "",
                        "engagement": 0
                    })
    except Exception as e:
        data["failures"].append(f"agent-reach {label}: {str(e)}")

print("Fetching from Reddit via agent-reach...", file=sys.stderr)
# Reddit searches  
reddit_searches = [
    ("r/artificial", "artificial"),
    ("r/LocalLLaMA", "LocalLLaMA"),
    ("r/CryptoCurrency", "CryptoCurrency"),
    ("r/dogecoin", "dogecoin")
]

for sub_label, sub_name in reddit_searches:
    try:
        # Try using opencli if available
        result = subprocess.run(
            f"opencli reddit subreddit -s {sub_name} -f yaml 2>/dev/null | head -50",
            shell=True, capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0 and result.stdout:
            # Parse YAML-like output
            for line in result.stdout.split('\n'):
                if 'title' in line.lower() or 'post' in line.lower():
                    bucket = "ai" if "artificial" in sub_name.lower() or "llama" in sub_name.lower() else "crypto"
                    data[bucket].append({
                        "source": f"Reddit {sub_label}",
                        "url": "",
                        "title": line[:150],
                        "snippet_or_text": line,
                        "author": "",
                        "published": "",
                        "engagement": 0
                    })
    except Exception as e:
        data["failures"].append(f"Reddit {sub_label}: {str(e)}")

# Trim and deduplicate
for bucket in ["venice", "ai", "crypto"]:
    seen_urls = set()
    unique = []
    for item in data[bucket][:60]:  # Keep within reasonable limits
        url = item.get("url", "")
        if url and url in seen_urls:
            continue
        seen_urls.add(url)
        unique.append(item)
    data[bucket] = unique

print(json.dumps(data, indent=2))
