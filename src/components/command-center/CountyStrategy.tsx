import React from 'react';

// ════════════════════════════════════════════════════════════════
// County Strategy — Top 10 Florida Counties Dashboard
// ════════════════════════════════════════════════════════════════

interface CountyData {
    rank: number;
    name: string;
    population: string;
    description: string;
    clerkUrl: string;
    excessUrl: string;
}

const TOP_COUNTIES: CountyData[] = [
    {
        rank: 1,
        name: 'Miami-Dade',
        population: '2.7M',
        description: 'Highest volume, highest property values, most surplus opportunity.',
        clerkUrl: 'https://miamidadeclerk.gov',
        excessUrl: 'https://excesselite.com/boards/6/pins/57'
    },
    {
        rank: 2,
        name: 'Broward',
        population: '1.9M',
        description: 'Dense, consistent foreclosure activity, stable market.',
        clerkUrl: 'https://www.browardclerk.org',
        excessUrl: 'https://excesselite.com/boards/6/pins/29'
    },
    {
        rank: 3,
        name: 'Palm Beach',
        population: '1.5M',
        description: 'High-wealth area, large surplus amounts per case.',
        clerkUrl: 'https://www.mypalmbeachclerk.com',
        excessUrl: 'https://excesselite.com/boards/6/pins/63'
    },
    {
        rank: 4,
        name: 'Hillsborough',
        population: '1.5M',
        description: 'Tampa metro, high tax deed volume and fast turnovers.',
        clerkUrl: 'https://www.hillsclerk.com',
        excessUrl: 'https://excesselite.com/boards/6/pins/23'
    },
    {
        rank: 5,
        name: 'Orange',
        population: '1.4M',
        description: 'Orlando metro, rapidly growing urban surplus pool.',
        clerkUrl: 'https://www.myorangeclerk.com',
        excessUrl: 'https://excesselite.com/boards/6/pins/61'
    },
    {
        rank: 6,
        name: 'Duval',
        population: '1.0M',
        description: 'Jacksonville, significant urban surplus, lower competition.',
        clerkUrl: 'https://www.duvalclerk.com',
        excessUrl: 'https://excesselite.com/boards/6/pins/36'
    },
    {
        rank: 7,
        name: 'Pinellas',
        population: '0.98M',
        description: 'St. Pete/Clearwater, high density, older home base.',
        clerkUrl: 'https://www.mypinellasclerk.org',
        excessUrl: 'https://excesselite.com/boards/6/pins/65'
    },
    {
        rank: 8,
        name: 'Lee',
        population: '0.76M',
        description: 'Fort Myers area, high post-hurricane turnover activity.',
        clerkUrl: 'https://www.leeclerk.org',
        excessUrl: 'https://excesselite.com/boards/6/pins/16'
    },
    {
        rank: 9,
        name: 'Polk',
        population: '0.75M',
        description: 'Large geographic scale, frequent tax deed sales.',
        clerkUrl: 'https://www.polkcountyclerk.net',
        excessUrl: 'https://excesselite.com/boards/6/pins/66'
    },
    {
        rank: 10,
        name: 'Volusia',
        population: '0.56M',
        description: 'Daytona area, consistent activity, manageable volume.',
        clerkUrl: 'https://www.volusiaclerk.org',
        excessUrl: 'https://excesselite.com/boards/6/pins/74'
    }
];

export function CountyStrategy() {
    return (
        <div className="space-y-6">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-emerald-400 mb-2 font-serif italic">📈 Florida Territory Strategy</h2>
                <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                    Focus on these Top 10 counties to cover approximately 80% of Florida's total surplus funds volume.
                    Miami-Dade, Broward, and Palm Beach (The Tri-County Area) are your primary targets for high-value cases.
                </p>
            </div>

            <div className="overflow-hidden border border-white/10 rounded-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 uppercase tracking-widest text-[10px] font-bold text-white/40">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">County</th>
                            <th className="px-6 py-4">Population</th>
                            <th className="px-6 py-4">Market Insight</th>
                            <th className="px-6 py-4 text-right">Resources / Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {TOP_COUNTIES.map((county) => (
                            <tr key={county.rank} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5 font-mono text-white/30">{county.rank}</td>
                                <td className="px-6 py-5">
                                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {county.name}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-white/60">{county.population}</td>
                                <td className="px-6 py-5 text-white/50 leading-relaxed max-w-sm">
                                    {county.description}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex flex-col gap-1.5 items-end">
                                        <a
                                            href={county.excessUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all text-[10px] font-bold w-32"
                                        >
                                            🦅 Excess Elite
                                        </a>
                                        <a
                                            href={county.clerkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] font-medium w-32"
                                        >
                                            🔍 Clerk Search
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                        <span>🎯</span> Why these 10?
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed">
                        These counties represent the highest concentration of real estate value and foreclosure volume in Florida.
                        Targeting them provides the best ROI on your skip-tracing and outreach efforts.
                    </p>
                </div>
                <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                        <span>🦅</span> Pro Tip
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed">
                        Always check "Tax Deed Surplus" and "Mortgage Foreclosure Surplus" lists separately for each county.
                        Miami-Dade alone often has more active surplus lists than 20 smaller counties combined.
                    </p>
                </div>
            </div>
        </div>
    );
}
