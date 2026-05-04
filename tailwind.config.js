/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      /* ── Colors (auto-switch via CSS vars in global.css) ── */
      colors: {
        background:       'var(--background)',
        surface:          'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',

        border:           'var(--border)',
        'border-subtle':  'var(--border-subtle)',

        text:             'var(--text)',
        'text-sub':       'var(--text-sub)',
        'text-muted':     'var(--text-muted)',

        accent:           'var(--accent)',
        'accent-fg':      'var(--accent-fg)',
        'accent-subtle':  'var(--accent-subtle)',

        watched:          'var(--watched)',
        'watched-subtle': 'var(--watched-subtle)',

        rating:           'var(--rating)',

        error:            'var(--error)',
        'error-subtle':   'var(--error-subtle)',
        success:          'var(--success)',
        'success-subtle': 'var(--success-subtle)',

        overlay:          'var(--overlay)',
      },

      /* ── Font families ────────────────────────────────────── */
      fontFamily: {
        // Sora — headings, display text
        display:         ['Sora-Bold'],
        heading:         ['Sora-SemiBold'],
        'heading-regular': ['Sora-Regular'],

        // Inter — body, UI labels, descriptions
        body:            ['Inter-Regular'],
        'body-medium':   ['Inter-Medium'],
        'body-semibold': ['Inter-SemiBold'],

        // Space Mono — ratings, counts, episode numbers, stats
        mono:            ['SpaceMono-Regular'],
        'mono-bold':     ['SpaceMono-Bold'],
      },

      /* ── Font sizes ───────────────────────────────────────── */
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:    ['12px', { lineHeight: '16px' }],
        sm:    ['13px', { lineHeight: '18px' }],
        base:  ['15px', { lineHeight: '22px' }],
        md:    ['17px', { lineHeight: '24px' }],
        lg:    ['20px', { lineHeight: '28px' }],
        xl:    ['24px', { lineHeight: '32px' }],
        '2xl': ['30px', { lineHeight: '38px' }],
        '3xl': ['36px', { lineHeight: '44px' }],
      },

      /* ── Border radius ────────────────────────────────────── */
      borderRadius: {
        sm:   '6px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        '2xl':'32px',
      },

      /* ── Spacing (4pt grid) ───────────────────────────────── */
      spacing: {
        0.5: '2px',
        1:   '4px',
        2:   '8px',
        3:   '12px',
        4:   '16px',
        5:   '20px',
        6:   '24px',
        7:   '28px',
        8:   '32px',
        10:  '40px',
        12:  '48px',
        16:  '64px',
        20:  '80px',
        24:  '96px',
      },
    },
  },
  plugins: [],
};
