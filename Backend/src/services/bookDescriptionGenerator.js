const themes = [
  {
    pattern: /\b(bible|scripture|faith|christian|prayer|gospel)\b/i,
    phrase: 'faith, scripture, and spiritual reflection',
  },
  {
    pattern: /\b(child|children|kids|bedtime|fairy|picture book)\b/i,
    phrase: 'imagination, discovery, and storytelling',
  },
  {
    pattern: /\b(business|entrepreneur|leadership|management|marketing)\b/i,
    phrase: 'business, leadership, and practical growth',
  },
  {
    pattern: /\b(love|romance|relationship|heart)\b/i,
    phrase: 'love, relationships, and human connection',
  },
  {
    pattern: /\b(mystery|detective|crime|secret|clue)\b/i,
    phrase: 'mystery, discovery, and unanswered questions',
  },
  {
    pattern: /\b(history|historical|past|heritage|ancient)\b/i,
    phrase: 'history, people, and perspectives from the past',
  },
  {
    pattern: /\b(motivation|habit|success|mindset|self.help|personal growth)\b/i,
    phrase: 'personal growth, fresh perspective, and everyday progress',
  },
];

const cleanText = (value, maxLength) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const generateBookDescription = ({ title, author, category, about }) => {
  const cleanTitle = cleanText(title, 180);
  const cleanAuthor = cleanText(author, 120);
  const cleanCategory = cleanText(category, 80);
  const cleanAbout = cleanText(about, 1200).replace(/\s+/g, ' ');

  if (!cleanTitle) {
    throw new Error('A book title is required to generate a description');
  }

  const sourceText = `${cleanTitle} ${cleanCategory} ${cleanAbout}`;
  const theme = themes.find(({ pattern }) => pattern.test(sourceText))?.phrase
    || (cleanCategory ? `${cleanCategory.toLowerCase()} reading` : 'a thoughtful reading experience');
  const authorText = cleanAuthor ? ` by ${cleanAuthor}` : '';
  const opening = `Discover ${cleanTitle}${authorText}, a book for readers interested in ${theme}.`;

  if (!cleanAbout) {
    return `${opening} A considered addition to a personal library or a thoughtful gift for a curious reader.`;
  }

  const notes = cleanAbout.replace(/[.!?]+$/, '');
  return `${opening} ${notes}. A considered addition to a personal library or a thoughtful gift for a curious reader.`;
};

module.exports = generateBookDescription;
