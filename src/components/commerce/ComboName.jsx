/** Decorative combo name (script lettering, soft gradient, heart ornament). Text stays plain for screen readers. */
const TONES = {
  'combo-nang-xinh': 'rose',
  'combo-nang-quyen-ru': 'berry',
  'combo-nang-thom': 'amber'
};

export default function ComboName({ combo }) {
  const name = String(combo?.title || '').replace(/\s*♡\s*$/, '');
  return (
    <span className="combo-name" data-tone={TONES[combo?.id] || 'rose'}>
      <span className="combo-name__text">{name}</span>
      <svg className="combo-name__heart" viewBox="0 0 24 22" aria-hidden="true" focusable="false">
        <path d="M12 21C5 15.6 1.5 12 1.5 7.6 1.5 4.5 3.9 2 7 2c2 0 3.8 1 5 2.8C13.2 3 15 2 17 2c3.1 0 5.5 2.5 5.5 5.6 0 4.4-3.5 8-10.5 13.4z" />
      </svg>
    </span>
  );
}
