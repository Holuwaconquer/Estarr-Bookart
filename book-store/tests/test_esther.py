import asyncio
import json
import unittest

from api.esther import app, parse_command


async def call_asgi(path, method, body=b""):
    messages = []
    request_delivered = False

    async def receive():
        nonlocal request_delivered
        if request_delivered:
            return {"type": "http.disconnect"}
        request_delivered = True
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(message):
        messages.append(message)

    await app(
        {"type": "http", "path": path, "method": method},
        receive,
        send,
    )
    return messages


class EstherCommandTests(unittest.TestCase):
    def test_requires_wake_word(self):
        self.assertEqual(parse_command("show me romance books")["intent"], "wake_required")

    def test_wake_word_alone_arms_assistant(self):
        self.assertEqual(parse_command("Hey Esther")["intent"], "wake")

    def test_search_books_extracts_topic(self):
        result = parse_command("Esther, show me books related to love")
        self.assertEqual(result["intent"], "search_books")
        self.assertEqual(result["query"], "love")

    def test_add_to_cart_extracts_title_and_quantity(self):
        result = parse_command("Esther add 2 copies of Daughters of Africa to my cart")
        self.assertEqual(result["intent"], "add_to_cart")
        self.assertEqual(result["title"], "Daughters of Africa")
        self.assertEqual(result["quantity"], 2)

    def test_add_without_title_asks_for_title(self):
        result = parse_command("Esther add a book to my cart")
        self.assertEqual(result["intent"], "unrecognized")
        self.assertIn("book title", result["message"])

    def test_checkout_requires_confirmation_in_client(self):
        result = parse_command("Esther take me to checkout")
        self.assertEqual(result["intent"], "navigate")
        self.assertEqual(result["page"], "checkout")

    def test_confirmation_phrase(self):
        result = parse_command("Esther, yes")
        self.assertEqual(result["intent"], "confirm")

    def test_vercel_asgi_endpoint_returns_json_intent(self):
        messages = asyncio.run(call_asgi(
            "/api/esther",
            "POST",
            json.dumps({"text": "Esther, find books about finance"}).encode(),
        ))
        self.assertEqual(messages[0]["status"], 200)
        self.assertEqual(
            json.loads(messages[1]["body"]),
            {
                "intent": "search_books",
                "query": "finance",
                "message": "Looking for books about finance.",
            },
        )

    def test_vercel_asgi_endpoint_rejects_get(self):
        messages = asyncio.run(call_asgi("/api/esther", "GET"))
        self.assertEqual(messages[0]["status"], 405)
        self.assertEqual(json.loads(messages[1]["body"])["error"], "Use POST to send a voice command")


if __name__ == "__main__":
    unittest.main()
