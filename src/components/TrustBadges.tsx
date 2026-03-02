export const TrustBadges = () => (
  <div
    className="flex flex-wrap justify-center gap-12 py-12 border-y border-black/5"
    role="list"
    aria-label="Trust credentials and ratings"
  >
    {['The Florida Bar', 'Google 5.0 Rating', 'AVVO 10.0 Rated', 'BBB Accredited A+'].map(badge => (
      <span
        key={badge}
        role="listitem"
        className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400"
      >
        {badge}
      </span>
    ))}
  </div>
);