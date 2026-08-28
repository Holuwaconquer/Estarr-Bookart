// components/AuthLayout.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';

// ---------------------------------------------------------------------
// Same palette as the rest of the app.
// ---------------------------------------------------------------------
const PURPLE = ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];
const AMBER = '#D97706';
const TEAL = '#0F766E';
const DEEP = '#4C1D95';

// ---------------------------------------------------------------------
// Bookshelf background — a row of book-spine bars, purely CSS shapes
// in the app palette (no stock photography). Deterministic (index-based,
// no Math.random) so it renders identically every time. Every 7th spine
// picks up amber or teal so the shelf isn't monochrome, same "two
// disciplined accents" rule used everywhere else.
// ---------------------------------------------------------------------
const spineColor = (i) => {
  if (i % 7 === 3) return AMBER;
  if (i % 7 === 6) return TEAL;
  return PURPLE[i % PURPLE.length];
};

const useShelfRow = (seed, count) =>
  useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        width: 14 + ((i * 7 + seed * 5) % 16),
        height: 70 + ((i * 37 + seed * 23) % 90),
        color: spineColor(i + seed),
      })),
    [seed, count]
  );

const ShelfRow = ({ seed, count, duration, reverse }) => {
  const spines = useShelfRow(seed, count);
  return (
    <motion.div
      className="flex items-end gap-2 flex-shrink-0"
      animate={{ x: reverse ? [0, 60, 0] : [0, -60, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {spines.map((s, i) => (
        <div
          key={i}
          className="rounded-t-sm flex-shrink-0"
          style={{ width: `${s.width}px`, height: `${s.height}px`, background: s.color, opacity: 0.5 }}
        />
      ))}
    </motion.div>
  );
};

const BookshelfBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {/* Soft, out-of-focus shelf rows — ambience, not detail */}
    <div className="absolute inset-0 flex flex-col justify-between py-16 opacity-[0.3] blur-[1.5px]" aria-hidden="true">
      <ShelfRow seed={0} count={26} duration={38} />
      <ShelfRow seed={1} count={24} duration={44} reverse />
      <ShelfRow seed={2} count={28} duration={34} />
    </div>

    {/* Purple wash from the top, same signature as the landing page blobs */}
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(180deg, ${DEEP}14 0%, transparent 45%)` }}
    />

    {/* Scrim: fades to paper behind the card, lets the shelf show at the edges */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(circle at 50% 45%, rgba(250,250,252,0.97) 0%, rgba(250,250,252,0.9) 35%, rgba(250,250,252,0.55) 65%, rgba(76,29,149,0.12) 100%)',
      }}
    />
  </div>
);

const AuthLayout = ({ children, title, subtitle, logo = true }) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-paper flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden"
    >
      <BookshelfBackground />

      {/* Subtle purple glow that follows the cursor — same idea as before, recolored into the palette */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s ease-out',
            background: `${PURPLE[2]}12`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {logo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-6"
          >
            <Link to="/" className="flex items-center gap-2">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${PURPLE[1]}, ${DEEP})` }}
              >
                <HiSparkles className="w-5 h-5" />
              </span>
              <span className="font-serif text-lg font-semibold text-ink">EStarr Bookart</span>
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-4xl font-semibold text-ink mb-2"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-ink/50"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {children}

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <Link
            to="/"
            className="text-sm text-ink/50 hover:text-ink transition-colors"
          >
            ← Go Back Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;