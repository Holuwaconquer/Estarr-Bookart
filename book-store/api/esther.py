import json
import re


WAKE_WORD = re.compile(r"^(?:(?:hey|okay|ok)\s+)?esther\b[\s,:-]*", re.IGNORECASE)
ADD_TO_CART = re.compile(
    r"^(?:please\s+)?(?:add|put|place|include)\s+(?:(\d{1,2})\s+)?"
    r"(?:(?:copies|books?)\s+of\s+)?(?:(?:a|the)\s+)?(?:book\s+)?"
    r"(.+?)\s+(?:to|in|into)\s+(?:my\s+)?cart[.! ]*$",
    re.IGNORECASE,
)
SEARCH_BOOKS = re.compile(
    r"^(?:please\s+)?(?:show|find|search|browse|recommend|look\s+for)"
    r"(?:\s+me)?\s+(?:some\s+)?(?:books?\s+)?"
    r"(?:(?:related\s+to|about|on|in(?:\s+the)?\s+category|for)\s+)?"
    r"(.+?)(?:\s+books?)?[.! ]*$",
    re.IGNORECASE,
)

PAGES = (
    (re.compile(r"\b(?:checkout|check out|pay|payment)\b", re.IGNORECASE), "checkout"),
    (re.compile(r"\b(?:cart|basket|shopping bag)\b", re.IGNORECASE), "cart"),
    (re.compile(r"\b(?:wishlist|wish list|saved books)\b", re.IGNORECASE), "wishlist"),
    (re.compile(r"\b(?:contact|contact us|support)\b", re.IGNORECASE), "contact"),
    (re.compile(r"\b(?:home|homepage|main page)\b", re.IGNORECASE), "home"),
)


def parse_command(text):
    if not isinstance(text, str) or not text.strip():
        return {
            "intent": "unrecognized",
            "message": "Say “Esther” followed by a command, such as “show me books about finance.”",
        }

    command = text.strip()
    wake_match = WAKE_WORD.match(command)
    if not wake_match:
        return {
            "intent": "wake_required",
            "message": "Start your command by saying “Esther.”",
        }

    command = command[wake_match.end():].strip()
    if not command:
        return {"intent": "wake", "message": "I’m listening. What can I help you find?"}

    if re.fullmatch(r"(?:yes|yeah|confirm|continue|go ahead|okay|ok)[.! ]*", command, re.IGNORECASE):
        return {"intent": "confirm", "message": "Okay."}

    add_match = ADD_TO_CART.match(command)
    if add_match:
        title = add_match.group(2).strip(" \t.,!?")
        title = re.sub(r"^(?:the\s+)?book\s+", "", title, flags=re.IGNORECASE).strip()
        if title and title.lower() not in {"book", "a book", "the book"}:
            quantity = max(1, min(int(add_match.group(1) or 1), 20))
            return {
                "intent": "add_to_cart",
                "title": title,
                "quantity": quantity,
                "message": f"I’ll look for {title}.",
            }
    if re.match(r"^(?:please\s+)?(?:add|put|place|include)\b", command, re.IGNORECASE):
        return {
            "intent": "unrecognized",
            "message": "Tell me the book title you want added to your cart.",
        }

    for pattern, page in PAGES:
        if pattern.search(command):
            messages = {
                "checkout": "I can take you to checkout. Please confirm before I continue.",
                "cart": "Opening your cart.",
                "wishlist": "Opening your wishlist.",
                "contact": "Opening the contact page.",
                "home": "Taking you home.",
            }
            return {"intent": "navigate", "page": page, "message": messages[page]}

    search_match = SEARCH_BOOKS.match(command)
    if search_match:
        query = search_match.group(1).strip(" \t.,!?")
        if query and query.lower() not in {"books", "book"}:
            return {
                "intent": "search_books",
                "query": query,
                "message": f"Looking for books about {query}.",
            }

    return {
        "intent": "unrecognized",
        "message": "I can find books, add a book to your cart, or open your cart, wishlist, contact page, or checkout.",
    }


async def app(scope, receive, send):
    """Vercel Python ASGI entrypoint for /api/esther."""
    if scope.get("type") != "http":
        return

    method = scope.get("method", "GET").upper()
    path = scope.get("path", "").rstrip("/")

    if path not in {"", "/", "/api/esther"}:
        status = 404
        result = {"error": "Not found"}
    elif method != "POST":
        status = 405
        result = {"error": "Use POST to send a voice command"}
    else:
        body = bytearray()
        while True:
            event = await receive()
            if event["type"] == "http.disconnect":
                return
            body.extend(event.get("body", b""))
            if len(body) > 4096:
                status = 400
                result = {"error": "Request must contain a command under 4 KB"}
                break
            if not event.get("more_body", False):
                try:
                    payload = json.loads(body)
                except (json.JSONDecodeError, UnicodeDecodeError):
                    status = 400
                    result = {"error": "Request body must be valid JSON"}
                else:
                    text = payload.get("text") if isinstance(payload, dict) else None
                    if not isinstance(text, str) or len(text) > 1000:
                        status = 400
                        result = {"error": "Provide a command up to 1000 characters"}
                    else:
                        status = 200
                        result = parse_command(text)
                break

    response_body = json.dumps(result, ensure_ascii=False).encode("utf-8")
    await send({
        "type": "http.response.start",
        "status": status,
        "headers": [
            (b"content-type", b"application/json; charset=utf-8"),
            (b"content-length", str(len(response_body)).encode("ascii")),
            (b"cache-control", b"no-store"),
        ],
    })
    await send({
        "type": "http.response.body",
        "body": response_body,
    })
