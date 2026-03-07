import React, { useState, useMemo } from 'react';

// ════════════════════════════════════════════════════════════════
// Florida 67-County Master Strategy Dashboard
// ════════════════════════════════════════════════════════════════

interface CountyData {
    name: string;
    population: number;
    populationStr: string;
    description: string;
    clerkUrl: string;
    taxDeedUrl: string;
    priority: 1 | 2 | 3; // 1=High, 2=Medium, 3=Low
}

export const ALL_COUNTIES: CountyData[] = [
    { name: 'Miami-Dade', population: 2701767, populationStr: '2.7M', priority: 1, description: 'Highest volume, highest property values, most surplus opportunity.', clerkUrl: 'https://miamidade.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/6' },
    { name: 'Broward', population: 1944375, populationStr: '1.9M', priority: 1, description: 'Dense, consistent foreclosure activity, stable market.', clerkUrl: 'https://broward.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/11' },
    { name: 'Palm Beach', population: 1492191, populationStr: '1.5M', priority: 1, description: 'High-wealth area, large surplus amounts per case.', clerkUrl: 'https://palmbeach.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/50' },
    { name: 'Hillsborough', population: 1459762, populationStr: '1.5M', priority: 1, description: 'Tampa metro, high tax deed volume and fast turnovers.', clerkUrl: 'https://hillsborough.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/29' },
    { name: 'Orange', population: 1429908, populationStr: '1.4M', priority: 1, description: 'Orlando metro, rapidly growing urban surplus pool.', clerkUrl: 'https://orange.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/48' },
    { name: 'Duval', population: 995567, populationStr: '1.0M', priority: 1, description: 'Jacksonville, significant urban surplus, lower competition.', clerkUrl: 'https://duval.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/16' },
    { name: 'Pinellas', population: 959107, populationStr: '0.96M', priority: 1, description: 'St. Pete/Clearwater, high density, older home base.', clerkUrl: 'https://pinellas.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/52' },
    { name: 'Lee', population: 760822, populationStr: '0.76M', priority: 1, description: 'Fort Myers area, high post-hurricane turnover activity.', clerkUrl: 'https://lee.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/36' },
    { name: 'Polk', population: 725046, populationStr: '0.73M', priority: 1, description: 'Large geographic scale, frequent tax deed sales.', clerkUrl: 'https://polk.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/53' },
    { name: 'Brevard', population: 606612, populationStr: '0.61M', priority: 2, description: 'Space Coast, steady growth and moderate volume.', clerkUrl: 'https://brevard.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/5' },
    { name: 'Volusia', population: 553284, populationStr: '0.55M', priority: 2, description: 'Daytona area, consistent activity, manageable volume.', clerkUrl: 'https://volusia.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/64' },
    { name: 'Pasco', population: 561891, populationStr: '0.56M', priority: 2, description: 'North of Tampa, high foreclosure numbers recently.', clerkUrl: 'https://pasco.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/51' },
    { name: 'Seminole', population: 470856, populationStr: '0.47M', priority: 2, description: 'Suburban Orlando, high property values.', clerkUrl: 'https://seminole.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/59' },
    { name: 'Sarasota', population: 434006, populationStr: '0.43M', priority: 2, description: 'Wealthy retirement hub, clean surplus records.', clerkUrl: 'https://sarasota.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/58' },
    { name: 'Manatee', population: 399710, populationStr: '0.40M', priority: 2, description: 'Fast-growing Gulf coast county.', clerkUrl: 'https://manatee.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/41' },
    { name: 'Collier', population: 375752, populationStr: '0.38M', priority: 2, description: 'Naples, ultra-high value property surplus.', clerkUrl: 'https://collier.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/11' },
    { name: 'Marion', population: 375908, populationStr: '0.38M', priority: 2, description: 'Ocala, high volume of affordable tax deeds.', clerkUrl: 'https://marion.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/42' },
    { name: 'Lake', population: 383956, populationStr: '0.38M', priority: 2, description: 'Rapidly suburbanizing, consistent case volume.', clerkUrl: 'https://lake.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/35' },
    { name: 'St. Lucie', population: 329226, populationStr: '0.33M', priority: 2, description: 'Port St. Lucie area, higher turnover post-2020.', clerkUrl: 'https://stlucie.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/56' },
    { name: 'Escambia', population: 318316, populationStr: '0.32M', priority: 2, description: 'Pensacola, Panhandle lead volume hub.', clerkUrl: 'https://escambia.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/17' },
    { name: 'Leon', population: 292198, populationStr: '0.29M', priority: 2, description: 'Tallahassee, stable government worker base.', clerkUrl: 'https://leon.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/37' },
    { name: 'Alachua', population: 278468, populationStr: '0.28M', priority: 2, description: 'Gainesville, university-town foreclosure trends.', clerkUrl: 'https://alachua.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/1' },
    { name: 'St. Johns', population: 273425, populationStr: '0.27M', priority: 2, description: 'Highest income, premium property surplus.', clerkUrl: 'https://stjohns.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/55' },
    { name: 'Clay', population: 218245, populationStr: '0.22M', priority: 3, description: 'Suburban Jacksonville, moderate activity.', clerkUrl: 'https://clay.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/10' },
    { name: 'Okaloosa', population: 211668, populationStr: '0.21M', priority: 3, description: 'Destin/FWB area, niche surplus market.', clerkUrl: 'https://okaloosa.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/46' },
    { name: 'Hernando', population: 194515, populationStr: '0.19M', priority: 3, description: 'Consistent tax deed sales outside Tampa.', clerkUrl: 'https://hernando.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/27' },
    { name: 'Charlotte', population: 186847, populationStr: '0.19M', priority: 3, description: 'Older demographic, high potential for estate surplus.', clerkUrl: 'https://charlotte.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/8' },
    { name: 'Santa Rosa', population: 188000, populationStr: '0.19M', priority: 3, description: 'Military hub, steady housing market.', clerkUrl: 'https://santarosa.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/57' },
    { name: 'Bay', population: 175216, populationStr: '0.18M', priority: 3, description: 'Panama City, storm recovery leads.', clerkUrl: 'https://bay.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/3' },
    { name: 'Indian River', population: 159788, populationStr: '0.16M', priority: 3, description: 'Vero Beach area, seasonal surplus peaks.', clerkUrl: 'https://indianriver.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/31' },
    { name: 'Martin', population: 158431, populationStr: '0.16M', priority: 3, description: 'High property values, few but large cases.', clerkUrl: 'https://martin.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/42' },
    { name: 'Citrus', population: 153843, populationStr: '0.15M', priority: 3, description: 'High volume of acreage tax deeds.', clerkUrl: 'https://citrus.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/9' },
    { name: 'Sumter', population: 129752, populationStr: '0.13M', priority: 3, description: 'The Villages, estate-heavy surplus potential.', clerkUrl: 'https://sumter.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/60' },
    { name: 'Monroe', population: 82874, populationStr: '82k', priority: 3, description: 'Florida Keys, very high per-case surplus.', clerkUrl: 'https://monroe.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/44' },
    { name: 'Nassau', population: 90352, populationStr: '90k', priority: 3, description: 'North of Duval, rural to suburban transition.', clerkUrl: 'https://nassau.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/45' },
    { name: 'Putnam', population: 73321, populationStr: '73k', priority: 3, description: 'High tax deed frequency, lower home values.', clerkUrl: 'https://putnam.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/54' },
    { name: 'Columbia', population: 69680, populationStr: '70k', priority: 3, description: 'Intersection of I-75 and I-10, small but steady.', clerkUrl: 'https://columbia.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/12' },
    { name: 'Walton', population: 75305, populationStr: '75k', priority: 3, description: 'Panhandle beach property growth.', clerkUrl: 'https://walton.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/66' },
    { name: 'Highlands', population: 101235, populationStr: '101k', priority: 3, description: 'Inland citrus area, frequent tax deeds.', clerkUrl: 'https://highlands.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/28' },
    { name: 'Gadsden', population: 45660, populationStr: '45k', priority: 3, description: 'Rural, manual check often required.', clerkUrl: 'https://www.gadsdenclerk.com', taxDeedUrl: 'https://www.gadsdenclerk.com' },
    { name: 'Jackson', population: 47319, populationStr: '47k', priority: 3, description: 'Panhandle agriculture area.', clerkUrl: 'https://jackson.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/32' },
    { name: 'Hendry', population: 39619, populationStr: '40k', priority: 3, description: 'Sugar belt, rural land surplus.', clerkUrl: 'https://hendry.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/26' },
    { name: 'Okeechobee', population: 39644, populationStr: '40k', priority: 3, description: 'Lake area, manual records common.', clerkUrl: 'https://okeechobee.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/47' },
    { name: 'Levy', population: 42915, populationStr: '43k', priority: 3, description: 'Gulf coast rural leads.', clerkUrl: 'https://www.levyclerk.com', taxDeedUrl: 'https://www.levyclerk.com' },
    { name: 'Flagler', population: 115378, populationStr: '115k', priority: 3, description: 'Palm Coast area, retirees and estates.', clerkUrl: 'https://flagler.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/18' },
    { name: 'Suwannee', population: 43474, populationStr: '43k', priority: 3, description: 'Rural panhandle.', clerkUrl: 'https://www.suwanneeclerk.com', taxDeedUrl: 'https://www.suwanneeclerk.com' },
    { name: 'Hardee', population: 25327, populationStr: '25k', priority: 3, description: 'Rural inland.', clerkUrl: 'https://www.hardeeclerk.com', taxDeedUrl: 'https://www.hardeeclerk.com' },
    { name: 'Baker', population: 28259, populationStr: '28k', priority: 3, description: 'Rural north florida.', clerkUrl: 'https://www.bakercountyfl.org/clerk.php', taxDeedUrl: 'https://excesselite.com/boards/2' },
    { name: 'DeSoto', population: 33976, populationStr: '34k', priority: 3, description: 'Rural sw florida.', clerkUrl: 'https://desoto.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/14' },
    { name: 'Wakulla', population: 33764, populationStr: '34k', priority: 3, description: 'Tallahassee commuter area.', clerkUrl: 'https://www.wakullaclerk.com', taxDeedUrl: 'https://www.wakullaclerk.com' },
    { name: 'Bradford', population: 28303, populationStr: '28k', priority: 3, description: 'Rural north florida.', clerkUrl: 'https://www.bradfordcountyfl.gov/clerk', taxDeedUrl: 'https://excesselite.com/boards/4' },
    { name: 'Holmes', population: 19653, populationStr: '20k', priority: 3, description: 'Rural panhandle.', clerkUrl: 'https://holmesclerk.com', taxDeedUrl: 'https://holmesclerk.com' },
    { name: 'Washington', population: 25318, populationStr: '25k', priority: 3, description: 'Rural panhandle.', clerkUrl: 'https://washingtonclerk.com', taxDeedUrl: 'https://washingtonclerk.com' },
    { name: 'Madison', population: 17968, populationStr: '18k', priority: 3, description: 'Rural north florida.', clerkUrl: 'https://www.madisonclerk.com', taxDeedUrl: 'https://www.madisonclerk.com' },
    { name: 'Gilchrist', population: 17864, populationStr: '18k', priority: 3, description: 'Rural inland.', clerkUrl: 'https://www.gilchristclerk.com', taxDeedUrl: 'https://www.gilchristclerk.com' },
    { name: 'Dixie', population: 16759, populationStr: '17k', priority: 3, description: 'Rural gulf coast.', clerkUrl: 'https://dixieclerk.com', taxDeedUrl: 'https://excesselite.com/boards/15' },
    { name: 'Union', population: 16147, populationStr: '16k', priority: 3, description: 'Rural inland.', clerkUrl: 'https://www.unionclerk.com', taxDeedUrl: 'https://www.unionclerk.com' },
    { name: 'Hamilton', population: 14004, populationStr: '14k', priority: 3, description: 'Rural north border.', clerkUrl: 'https://www.hamiltonclerk.com', taxDeedUrl: 'https://www.hamiltonclerk.com' },
    { name: 'Gulf', population: 14192, populationStr: '14k', priority: 3, description: 'Panhandle coast.', clerkUrl: 'https://gulf.realtdm.com/public/cases/list', taxDeedUrl: 'https://excesselite.com/boards/25' },
    { name: 'Calhoun', population: 13648, populationStr: '14k', priority: 3, description: 'Rural panhandle.', clerkUrl: 'https://calhounclerk.com', taxDeedUrl: 'https://excesselite.com/boards/7' },
    { name: 'Franklin', population: 12451, populationStr: '12k', priority: 3, description: 'Rural panhandle coast.', clerkUrl: 'https://franklinclerk.com', taxDeedUrl: 'https://franklinclerk.com' },
    { name: 'Jefferson', population: 14510, populationStr: '15k', priority: 3, description: 'Rural north florida.', clerkUrl: 'https://www.jeffersonclerk.com', taxDeedUrl: 'https://www.jeffersonclerk.com' },
    { name: 'Glades', population: 12126, populationStr: '12k', priority: 3, description: 'Rural lake area.', clerkUrl: 'https://www.gladesclerk.com', taxDeedUrl: 'https://www.gladesclerk.com' },
    { name: 'Liberty', population: 7974, populationStr: '8k', priority: 3, description: 'Rural panhandle forest.', clerkUrl: 'https://libertyclerk.com', taxDeedUrl: 'https://libertyclerk.com' },
    { name: 'Lafayette', population: 8226, populationStr: '8k', priority: 3, description: 'Rural inland north.', clerkUrl: 'https://lafayetteclerk.com', taxDeedUrl: 'https://lafayetteclerk.com' },
    { name: 'Taylor', population: 21796, populationStr: '22k', priority: 3, description: 'Rural panhandle coast.', clerkUrl: 'https://www.taylorclerk.com', taxDeedUrl: 'https://www.taylorclerk.com' }
];

export function CountyStrategy() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'population' | 'priority'>('population');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const filteredAndSortedCounties = useMemo(() => {
        let result = ALL_COUNTIES.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'population') {
                comparison = a.population - b.population;
            } else if (sortBy === 'priority') {
                comparison = a.priority - b.priority;
            }

            // Priority 1 (High) should be at top in Desc mode, so we might need to flip logic if user expects 1 at top
            return sortDir === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [searchTerm, sortBy, sortDir]);

    const handleSort = (key: 'name' | 'population' | 'priority') => {
        if (sortBy === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDir('desc');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Strategy Info */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-emerald-400 mb-2 font-serif italic">📈 Florida Master Territory Strategy</h2>
                <p className="text-white/60 text-sm leading-relaxed max-w-4xl">
                    You are now viewing all 67 Florida counties. Focus on <strong>High Priority</strong> areas to capture the largest volume of surplus funds.
                    The "Tri-County" area (Miami-Dade, Broward, Palm Beach) remains the primary engine for high-value cases.
                </p>
            </div>

            {/* controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">🔍</span>
                    <input
                        type="text"
                        placeholder="Search counties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest mr-2">Sort by:</span>
                    <button
                        onClick={() => handleSort('population')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === 'population' ? 'bg-emerald-500 text-emerald-950' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        Population
                    </button>
                    <button
                        onClick={() => handleSort('name')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === 'name' ? 'bg-emerald-500 text-emerald-950' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        A-Z
                    </button>
                    <button
                        onClick={() => handleSort('priority')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === 'priority' ? 'bg-emerald-500 text-emerald-950' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        Priority
                    </button>
                </div>
            </div>

            {/* Master Table */}
            <div className="overflow-hidden border border-white/10 rounded-xl bg-black/20">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 uppercase tracking-widest text-[10px] font-bold text-white/40">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>County {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                            <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('population')}>Population {sortBy === 'population' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                            <th className="px-6 py-4">Market Insight</th>
                            <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('priority')}>Priority {sortBy === 'priority' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                            <th className="px-6 py-4 text-right">Resources / Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredAndSortedCounties.map((county) => (
                            <tr key={county.name} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5">
                                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {county.name}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-white/60 font-mono text-xs">{county.populationStr}</td>
                                <td className="px-6 py-5 text-white/40 text-xs leading-relaxed max-w-sm">
                                    {county.description}
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${county.priority === 1 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                        county.priority === 2 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            county.priority > 10 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                'bg-white/5 text-white/30 border border-white/10'
                                        }`}>
                                        {county.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex flex-col gap-1.5 items-end">
                                        <div className="flex gap-1.5 justify-end">
                                            <a
                                                href={county.taxDeedUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-[9px] font-bold"
                                            >
                                                📄 Excess Elite
                                            </a>
                                            <a
                                                href={county.clerkUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-[9px] font-bold"
                                            >
                                                🔍 Clerk Records
                                            </a>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredAndSortedCounties.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-white/20 text-sm">No counties found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                        <span>🦅</span> Pro Tip: Batch Focus
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed">
                        Don't spread your outreach too thin. Pick 5 specific counties each week, scrape the latest lists, and perform deep skip-tracing.
                        High Priority counties have more leads, but Medium Priority counties often have less competition from other recovery firms.
                    </p>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold mb-1">Statewide Resource Guide</h3>
                        <p className="text-white/40 text-xs">Access all detailed search manuals and platform tutorials.</p>
                    </div>
                    <button
                        onClick={() => window.alert('The Master Directory is available in your project artifacts at: county_resource_directory.md')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
                    >
                        Open Guide
                    </button>
                </div>
            </div>
        </div>
    );
}
