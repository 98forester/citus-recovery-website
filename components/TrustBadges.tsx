export const TrustBadges = () => (
  <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale py-12 border-y border-black/5">
    {['The Florida Bar', 'Google 5.0 Rating', 'AVVO 10.0 Rated', 'BBB Accredited A+'].map(badge => (
      <span key={badge} className="text-[10px] uppercase tracking-[0.3em] font-bold">{badge}</span>
    ))}
  </div>
);