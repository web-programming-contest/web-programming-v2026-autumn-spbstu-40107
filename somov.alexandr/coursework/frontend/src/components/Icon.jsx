const paths = {
  cart: 'M3 3h2l2 11h11l3-8H6 M9 19h.01 M17 19h.01',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  grid: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h6v6h-6z',
  arrow: 'm9 5 7 7-7 7',
  close: 'm6 6 12 12 M6 18 18 6',
  phone: 'M7 2h10v20H7z M11 18h2',
  mail: 'M2 4h20v16H2z m0 0 10 9L22 4',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  sparkles: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',
  flame: 'M13 2c1 6-5 7-3 12 2-1 3-3 3-5 5 4 8 7 5 11-3 4-11 3-13-2-2-5 2-9 5-12-1 4 0 5 1 6 3-4 3-7 2-10Z',
  rocket: 'M14 3c3-1 7-1 7-1s0 4-1 7l-8 8-5-5Z M7 8H3l-1 6 5-2 M16 17v4l-6 1 2-5 M5 17l-3 5 5-3 M16 7h.01',
  refund: 'M20 7a9 9 0 1 0 1 8 M20 2v5h-5 M10 17V7h4a3 3 0 0 1 0 6H8 M8 16h7',
  certificate: 'M3 3h18v14H3z M6 7h8 M6 11h5 M13 16l-1 6 4-2 4 2-1-6 M20 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
};

export default function Icon({name, className = ''}) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
