import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiMicrophone, HiX, HiPaperAirplane, HiSparkles } from 'react-icons/hi';
import { useCart } from '../contexts/CartContext';
import { bookAPI } from '../services/api';

const wakeWord = /^(?:(?:hey|okay|ok)\s+)?esther\b/i;

const getBooks = (response) => {
  if (Array.isArray(response?.data?.books)) return response.data.books;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.books)) return response.books;
  return [];
};

const getPreferredVoice = () => {
  const voices = window.speechSynthesis?.getVoices() || [];
  const femaleVoicePattern = /\b(female|woman|samantha|victoria|karen|zira|aria|jenny|susan|ava|allison|sara)\b/i;
  return voices.find((voice) => femaleVoicePattern.test(voice.name))
    || voices.find((voice) => /^en[-_]NG$/i.test(voice.lang))
    || voices.find((voice) => /^en([-_]|$)/i.test(voice.lang))
    || null;
};

const EstherAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Tap the microphone to start.');
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi, I’m Esther. Tap the microphone and say “Esther” followed by a command, or type a command below.' },
  ]);
  const [bookMatches, setBookMatches] = useState([]);
  const [checkoutConfirmation, setCheckoutConfirmation] = useState(false);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const wakeArmedRef = useRef(false);
  const checkoutConfirmationRef = useRef(false);
  const messagesEndRef = useRef(null);
  const preferredVoiceRef = useRef(null);
  const recognitionRestartTimerRef = useRef(null);

  useEffect(() => {
    checkoutConfirmationRef.current = checkoutConfirmation;
  }, [checkoutConfirmation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  useEffect(() => {
    const loadPreferredVoice = () => {
      preferredVoiceRef.current = getPreferredVoice();
    };
    loadPreferredVoice();
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadPreferredVoice);
    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadPreferredVoice);
    };
  }, []);

  useEffect(() => () => {
    listeningRef.current = false;
    window.clearTimeout(recognitionRestartTimerRef.current);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  const addMessage = (role, text) => {
    setMessages((current) => [...current, { role, text }].slice(-20));
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    speakingRef.current = true;
    recognitionRef.current?.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    const preferredVoice = preferredVoiceRef.current || getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = 'en-NG';
    }
    utterance.onstart = () => { speakingRef.current = true; };
    utterance.onend = () => {
      speakingRef.current = false;
      if (listeningRef.current) {
        setVoiceStatus('Listening for your command…');
        window.clearTimeout(recognitionRestartTimerRef.current);
        recognitionRestartTimerRef.current = window.setTimeout(() => {
          try {
            if (listeningRef.current) recognitionRef.current?.start();
          } catch (error) {
            console.warn('Voice recognition could not restart:', error);
          }
        }, 300);
      }
    };
    utterance.onerror = () => {
      speakingRef.current = false;
    };
    window.speechSynthesis.speak(utterance);
  };

  const respond = (text) => {
    addMessage('assistant', text);
    speak(text);
  };

  const executeNavigation = (page) => {
    const paths = {
      home: '/',
      cart: '/cart',
      checkout: '/checkout',
      wishlist: '/dashboard/wishlist',
      contact: '/contact',
    };
    if (paths[page]) navigate(paths[page]);
  };

  const addSelectedBook = async (book, quantity) => {
    const available = Number(book.stock);
    if (Number.isFinite(available) && available < quantity) {
      setBookMatches([]);
      respond(`There are only ${available} copies of ${book.title} available.`);
      return;
    }

    await addToCart(book, quantity);
    setBookMatches([]);
    respond(`${quantity === 1 ? 'Added' : `Added ${quantity} copies of`} ${book.title} to your cart.`);
  };

  const runIntent = async (intent) => {
    if (intent.intent === 'wake') {
      wakeArmedRef.current = true;
      respond(intent.message);
      return;
    }
    if (intent.intent === 'wake_required' || intent.intent === 'unrecognized') {
      respond(intent.message);
      return;
    }
    if (intent.intent === 'search_books') {
      const query = intent.query?.trim();
      if (!query) {
        respond('What kind of books would you like me to find?');
        return;
      }
      setBookMatches([]);
      navigate(`/category?q=${encodeURIComponent(query)}`);
      respond(`Showing books related to ${query}.`);
      return;
    }
    if (intent.intent === 'add_to_cart') {
      const response = await bookAPI.searchBooks(intent.title, { limit: 10 });
      const matches = getBooks(response);
      const normalizedTitle = intent.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const exactMatches = matches.filter((book) => (
        String(book.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalizedTitle
      ));
      const choices = exactMatches.length ? exactMatches : matches;

      if (!choices.length) {
        respond(`I couldn’t find a book called ${intent.title}. You can ask me to search for it instead.`);
        return;
      }
      if (choices.length === 1) {
        await addSelectedBook(choices[0], intent.quantity || 1);
        return;
      }
      setBookMatches(choices.slice(0, 5).map((book) => ({
        ...book,
        requestedQuantity: intent.quantity || 1,
      })));
      respond(`I found a few possible matches for ${intent.title}. Choose the book you meant.`);
      return;
    }
    if (intent.intent === 'navigate' && intent.page === 'checkout') {
      setCheckoutConfirmation(true);
      respond(intent.message || 'Please confirm before I take you to checkout.');
      return;
    }
    if (intent.intent === 'confirm') {
      if (checkoutConfirmationRef.current) {
        setCheckoutConfirmation(false);
        checkoutConfirmationRef.current = false;
        respond('Taking you to checkout. You can review your order before paying.');
        executeNavigation('checkout');
      } else {
        respond('There is no pending action to confirm. Tell me what you would like to do.');
      }
      return;
    }
    if (intent.intent === 'navigate') {
      executeNavigation(intent.page);
      respond(intent.message);
      return;
    }

    respond(intent.message || 'I’m not sure how to do that yet.');
  };

  const submitCommand = async (rawText, isVoice = false) => {
    const text = rawText.trim();
    if (!text || busy) return;
    setBusy(true);
    setBookMatches([]);
    addMessage('user', text);

    const command = !wakeWord.test(text) && (
      !isVoice || wakeArmedRef.current
    ) ? `Esther ${text}` : text;

    try {
      const response = await fetch('/api/esther', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: command }),
      });
      const responseText = await response.text();
      let intent;
      try {
        intent = responseText ? JSON.parse(responseText) : null;
      } catch {
        const responseHint = responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
        throw new Error(responseHint
          ? `Esther’s endpoint returned an unexpected response (HTTP ${response.status}): ${responseHint}`
          : `Esther’s endpoint returned an empty response (HTTP ${response.status}). Confirm the Python function is deployed at /api/esther.`);
      }
      if (!intent || typeof intent !== 'object') {
        throw new Error(`Esther’s endpoint returned an empty response (HTTP ${response.status}). Confirm the Python function is deployed at /api/esther.`);
      }
      if (!response.ok) throw new Error(intent.error || 'Esther could not understand that request');

      if (wakeWord.test(command) && intent.intent !== 'wake') {
        wakeArmedRef.current = false;
      }
      await runIntent(intent);
    } catch (error) {
      console.error('Esther command failed:', error);
      respond(error.message || 'I couldn’t complete that command. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const toggleListening = () => {
    if (listeningRef.current) {
      listeningRef.current = false;
      setListening(false);
      setVoiceStatus('Microphone is off.');
      window.clearTimeout(recognitionRestartTimerRef.current);
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      respond('Voice recognition is not available in this browser. You can type your command instead.');
      setOpen(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => setVoiceStatus('Listening… say “Esther” and your request.');
    recognition.onresult = (event) => {
      const finalTranscript = [];
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim();
        if (!transcript) continue;
        if (result.isFinal) finalTranscript.push(transcript);
        else interimTranscript += `${transcript} `;
      }

      if (interimTranscript.trim()) setVoiceStatus(`I heard: “${interimTranscript.trim()}”`);
      if (finalTranscript.length) {
        setVoiceStatus('Working on your request…');
        submitCommand(finalTranscript.join(' '), true);
      }
    };
    recognition.onerror = (event) => {
      const recoverableMessages = {
        'no-speech': 'I didn’t detect speech. Try speaking after the listening indicator appears.',
        'nomatch': 'I heard speech but couldn’t make out the words. Try a shorter phrase.',
      };
      const fatalMessages = {
        'not-allowed': 'Microphone access is blocked. Allow it in your browser’s site settings, then tap the microphone again.',
        'service-not-allowed': 'The browser’s speech recognition service is unavailable. Check browser permissions or type your request.',
        'audio-capture': 'No microphone was found. Connect or enable a microphone, then try again.',
        'network': 'The browser speech service could not connect. Check your internet connection, or type your request.',
        'language-not-supported': 'This browser does not support the selected speech language. Try another supported browser.',
      };
      if (event.error === 'aborted') return;

      if (recoverableMessages[event.error]) {
        setVoiceStatus(recoverableMessages[event.error]);
        return;
      }
      const message = fatalMessages[event.error]
        || `Speech recognition stopped (${event.error || 'unknown error'}). You can type your request instead.`;
      listeningRef.current = false;
      setListening(false);
      setVoiceStatus(message);
      window.clearTimeout(recognitionRestartTimerRef.current);
      recognition.stop();
      addMessage('assistant', message);
    };
    recognition.onend = () => {
      if (!listeningRef.current || speakingRef.current) return;
      window.clearTimeout(recognitionRestartTimerRef.current);
      recognitionRestartTimerRef.current = window.setTimeout(() => {
        try {
          if (listeningRef.current && !speakingRef.current) recognition.start();
        } catch (error) {
          console.warn('Voice recognition could not restart:', error);
        }
      }, 300);
    };

    recognitionRef.current = recognition;
    listeningRef.current = true;
    setListening(true);
    setOpen(true);
    setVoiceStatus('Starting microphone…');
    try {
      recognition.start();
      respond('I’m listening. Say “Esther” and then your command.');
    } catch (error) {
      listeningRef.current = false;
      setListening(false);
      setVoiceStatus('Could not start microphone. Check browser permissions.');
      console.error('Could not start voice recognition:', error);
      respond('I couldn’t start the microphone. Please check your browser permissions.');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const command = input;
    setInput('');
    submitCommand(command);
  };

  const closeAssistant = () => {
    listeningRef.current = false;
    setListening(false);
    setVoiceStatus('Microphone is off.');
    window.clearTimeout(recognitionRestartTimerRef.current);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    speakingRef.current = false;
    setOpen(false);
  };

  const currentPageIsAdmin = location.pathname.startsWith('/admin');

  if (currentPageIsAdmin) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[80] sm:bottom-6 sm:right-24">
      {open && (
        <section
          aria-label="Esther voice assistant"
          className="mb-3 flex h-[min(70vh,34rem)] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-violet-900 to-violet-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <HiSparkles className="h-5 w-5 text-amber-200" />
              <div>
                <p className="font-semibold">Esther</p>
                <p className="text-xs text-white/70">{voiceStatus}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close Esther assistant"
              onClick={closeAssistant}
              className="rounded-lg p-2 hover:bg-white/10"
            >
              <HiX className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-violet-700 text-white'
                    : 'bg-[#f4f1f8] text-[#30243a]'
                }`}
              >
                {message.text}
              </div>
            ))}
            {busy && <p className="text-xs text-gray-500">Esther is working…</p>}
            {bookMatches.length > 0 && (
              <div className="space-y-2">
                {bookMatches.map((book) => (
                  <button
                    key={book._id || book.id}
                    type="button"
                    onClick={() => addSelectedBook(book, book.requestedQuantity)}
                    className="flex w-full items-center gap-3 rounded-xl border border-violet-100 p-2 text-left hover:bg-violet-50"
                  >
                    <img src={book.image} alt="" className="h-12 w-10 rounded object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{book.title}</span>
                      <span className="block truncate text-xs text-gray-500">{book.author}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {checkoutConfirmation && (
              <button
                type="button"
                onClick={() => {
                  setCheckoutConfirmation(false);
                  checkoutConfirmationRef.current = false;
                  executeNavigation('checkout');
                }}
                className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
              >
                Confirm and open checkout
              </button>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="Type a command for Esther"
              placeholder="Try: Esther, find finance books"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
              maxLength={300}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send command"
              className="rounded-xl bg-violet-700 p-2 text-white disabled:opacity-40"
            >
              <HiPaperAirplane className="h-5 w-5" />
            </button>
          </form>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleListening}
          aria-label={listening ? 'Stop voice commands' : 'Start voice commands'}
          aria-pressed={listening}
          className={`rounded-full p-3 text-white shadow-lg transition ${
            listening ? 'bg-rose-600 hover:bg-rose-700' : 'bg-violet-700 hover:bg-violet-800'
          }`}
        >
          <HiMicrophone className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default EstherAssistant;
