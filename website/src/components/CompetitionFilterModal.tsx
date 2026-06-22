'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe2, ChevronRight, Trophy } from 'lucide-react';
import { useState, useMemo } from 'react';

interface CompetitionFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCompetitions: string[];
  selectedCompetition: string;
  onSelect: (competition: string) => void;
}

const REGION_ICONS: Record<string, string> = {
  'ĐTQG (Quốc tế)': '🌍',
  'Cúp Câu Lạc Bộ': '🏆',
  'Châu Âu': '🇪🇺',
  'Châu Á': '🌏',
  'Châu Mỹ': '🌎',
  'Châu Phi': '🌍',
  'Khác': '🏳️'
};

const COMPETITION_MAPPING: Record<string, { region: string, country: string }> = {
  // ĐTQG (National Teams)
  'World Cup': { region: 'ĐTQG (Quốc tế)', country: 'Thế giới' },
  'FIFA World Cup': { region: 'ĐTQG (Quốc tế)', country: 'Thế giới' },
  'Euro': { region: 'ĐTQG (Quốc tế)', country: 'Châu Âu' },
  'Copa America': { region: 'ĐTQG (Quốc tế)', country: 'Nam Mỹ' },
  'AFC Asian Cup': { region: 'ĐTQG (Quốc tế)', country: 'Châu Á' },
  'African Cup': { region: 'ĐTQG (Quốc tế)', country: 'Châu Phi' },

  // Cúp Câu Lạc Bộ (Club Tournaments)
  'Champions League': { region: 'Cúp Câu Lạc Bộ', country: 'Châu Âu (UEFA)' },
  'Europa League': { region: 'Cúp Câu Lạc Bộ', country: 'Châu Âu (UEFA)' },
  'Conference League': { region: 'Cúp Câu Lạc Bộ', country: 'Châu Âu (UEFA)' },
  'Club World Cup': { region: 'Cúp Câu Lạc Bộ', country: 'Thế giới (FIFA)' },
  'AFC Champions League': { region: 'Cúp Câu Lạc Bộ', country: 'Châu Á (AFC)' },
  'Copa Libertadores': { region: 'Cúp Câu Lạc Bộ', country: 'Nam Mỹ (CONMEBOL)' },

  // Giải Vô Địch Quốc Gia (Domestic Leagues)
  'Premier League': { region: 'Châu Âu', country: 'Anh' },
  'FA Cup': { region: 'Châu Âu', country: 'Anh' },
  'La Liga': { region: 'Châu Âu', country: 'Tây Ban Nha' },
  'Serie A': { region: 'Châu Âu', country: 'Ý' },
  'Bundesliga': { region: 'Châu Âu', country: 'Đức' },
  'Ligue 1': { region: 'Châu Âu', country: 'Pháp' },
  'V-League': { region: 'Châu Á', country: 'Việt Nam' },
  'J1 League': { region: 'Châu Á', country: 'Nhật Bản' },
  'K League 1': { region: 'Châu Á', country: 'Hàn Quốc' },
  'MLS': { region: 'Châu Mỹ', country: 'Mỹ' }
};

export default function CompetitionFilterModal({ isOpen, onClose, availableCompetitions, selectedCompetition, onSelect }: CompetitionFilterModalProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Build the tree dynamically based on availableCompetitions
  const tree = useMemo(() => {
    const t: Record<string, Record<string, string[]>> = {};
    
    availableCompetitions.forEach(comp => {
      let region = 'Khác';
      let country = 'Khác';
      
      // Try to find in mapping (case insensitive partial match)
      for (const [key, val] of Object.entries(COMPETITION_MAPPING)) {
        if (comp.toLowerCase().includes(key.toLowerCase())) {
          region = val.region;
          country = val.country;
          break;
        }
      }

      if (!t[region]) t[region] = {};
      if (!t[region][country]) t[region][country] = [];
      if (!t[region][country].includes(comp)) {
        t[region][country].push(comp);
      }
    });
    
    return t;
  }, [availableCompetitions]);

  const regions = Object.keys(tree).sort((a, b) => {
    if (a === 'ĐTQG (Quốc tế)') return -1;
    if (b === 'ĐTQG (Quốc tế)') return 1;
    if (a === 'Cúp Câu Lạc Bộ') return -1;
    if (b === 'Cúp Câu Lạc Bộ') return 1;
    if (a === 'Khác') return 1;
    if (b === 'Khác') return -1;
    return a.localeCompare(b);
  });

  const handleSelect = (comp: string) => {
    onSelect(comp);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center p-4 z-[101]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0f1923] border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center cursor-pointer" onClick={() => setSelectedRegion(null)}>
                    <Globe2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Chọn Giải Đấu</h2>
                    <p className="text-gray-400 text-sm">
                      {selectedRegion ? `Khu vực: ${selectedRegion}` : 'Lọc kèo theo từng khu vực'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-white/[0.02] to-transparent min-h-[400px]">
                <AnimatePresence mode="wait">
                  {!selectedRegion ? (
                    <motion.div
                      key="regions"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-2"
                    >
                      <button
                        onClick={() => handleSelect('all')}
                        className={`w-full text-left px-5 py-4 rounded-xl font-bold transition-all flex items-center justify-between border
                          ${selectedCompetition === 'all' 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                            : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Globe2 className="w-5 h-5" />
                          <span className="text-lg">Tất cả giải đấu</span>
                        </div>
                      </button>

                      <div className="h-px bg-white/5 my-4" />

                      {regions.map(region => (
                        <button
                          key={region}
                          onClick={() => setSelectedRegion(region)}
                          className="w-full text-left px-5 py-4 rounded-xl font-bold transition-all flex items-center justify-between border bg-black/20 border-white/5 text-gray-300 hover:border-white/20 hover:bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{REGION_ICONS[region] || '🏳️'}</span>
                            <span className="text-lg">{region}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                      ))}

                      {regions.length === 0 && (
                        <div className="text-gray-500 text-sm text-center py-10">Chưa có giải đấu nào</div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="competitions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <button
                        onClick={() => setSelectedRegion(null)}
                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold bg-white/5 px-4 py-2 rounded-lg w-fit transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" /> Quay lại
                      </button>

                      {tree[selectedRegion] && Object.entries(tree[selectedRegion]).map(([country, comps]) => (
                        <div key={country} className="space-y-3">
                          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <div className="w-4 h-px bg-emerald-500/30" />
                            {country}
                          </h3>
                          <div className="flex flex-col gap-2">
                            {comps.map(comp => (
                              <button
                                key={comp}
                                onClick={() => handleSelect(comp)}
                                className={`text-left p-4 rounded-xl border transition-all flex items-center gap-4
                                  ${selectedCompetition === comp 
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                    : 'bg-black/20 border-white/5 text-gray-300 hover:border-white/20 hover:bg-white/5'}`}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                  ${selectedCompetition === comp ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                                  <Trophy className="w-5 h-5" />
                                </div>
                                <span className="font-bold flex-1">{comp}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
