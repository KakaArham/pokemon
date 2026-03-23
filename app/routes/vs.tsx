import { useState, useEffect } from "react";
import { Link, useLoaderData, useNavigation } from "react-router";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { Route } from "./+types/vs";
import "./vs.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pokédex - VS Battle" },
    { name: "description", content: "Compare Pokémon stats to see who wins!" },
  ];
}

export async function clientLoader() {
  const limit = 90;
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const data = await response.json();

    const pokemonList = data.results.map((pokemon: { name: string, url: string }) => {
      const idStr = pokemon.url.split("/").filter(Boolean).pop();
      const id = parseInt(idStr || "0", 10);
      return {
        id,
        name: pokemon.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      };
    });

    return { pokemonList };
  } catch (error) {
    console.error("VS loader fetch failed:", error);
    return { pokemonList: [] };
  }
}

export function HydrateFallback() {
  return <LoadingSpinner />;
}

function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder 
}: { 
  options: {id: number, name: string}[], 
  value: number | "", 
  onChange: (id: number | "") => void,
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const selectedOption = options.find(o => o.id === value);
  const filteredOptions = options.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.id.toString() === search
  );

  return (
    <div className="searchable-select" onMouseLeave={() => setIsOpen(false)}>
      <div 
        className="select-display pokemon-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span style={{ textTransform: 'capitalize' }}>
          {selectedOption ? `#${selectedOption.id} - ${selectedOption.name}` : placeholder}
        </span>
        <span className="dropdown-arrow">▼</span>
      </div>
      
      {isOpen && (
        <div className="select-dropdown glass-panel">
          <input 
            type="text" 
            className="select-search"
            placeholder="Search by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClick={e => e.stopPropagation()}
            autoFocus
          />
          <div className="options-list">
            <div 
              className="option-item" 
              onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
            >
              None
            </div>
            {filteredOptions.map(o => (
              <div 
                key={o.id}
                className="option-item"
                onClick={() => { onChange(o.id); setIsOpen(false); setSearch(""); }}
              >
                #{o.id} - <span style={{textTransform: 'capitalize'}}>{o.name}</span>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="option-item no-results">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VSPage() {
  const { pokemonList } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();

  // Pokemon selections
  const [selectedIdA, setSelectedIdA] = useState<number | "">("");
  const [selectedIdB, setSelectedIdB] = useState<number | "">("");

  // Detailed stats state
  const [detailsA, setDetailsA] = useState<any>(null);
  const [detailsB, setDetailsB] = useState<any>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Fetch details when selection changes
  useEffect(() => {
    if (!selectedIdA) {
      setDetailsA(null);
      return;
    }
    const fetchA = async () => {
      setLoadingA(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${selectedIdA}`);
        const data = await res.json();
        setDetailsA(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingA(false);
      }
    };
    fetchA();
  }, [selectedIdA]);

  useEffect(() => {
    if (!selectedIdB) {
      setDetailsB(null);
      return;
    }
    const fetchB = async () => {
      setLoadingB(true);
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${selectedIdB}`);
        const data = await res.json();
        setDetailsB(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingB(false);
      }
    };
    fetchB();
  }, [selectedIdB]);

  // Stat formatting
  const STAT_NAMES = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
  const displayNames: Record<string, string> = {
    "hp": "HP",
    "attack": "ATK",
    "defense": "DEF",
    "special-attack": "Sp.A",
    "special-defense": "Sp.D",
    "speed": "SPD"
  };

  const getStatValue = (details: any, statName: string) => {
    if (!details) return 0;
    const stat = details.stats.find((s: any) => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
  };

  const getTotalStats = (details: any) => {
    if (!details) return 0;
    return details.stats.reduce((total: number, s: any) => total + s.base_stat, 0);
  };

  const totalA = getTotalStats(detailsA);
  const totalB = getTotalStats(detailsB);

  let winner = null;
  if (detailsA && detailsB) {
    if (totalA > totalB) winner = "A";
    else if (totalB > totalA) winner = "B";
    else winner = "TIE";
  }

  return (
    <div className="vs-page animate-fade-in">
      <div className="vs-header">
        <Link to="/" className="back-link glass-panel">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Pokédex
        </Link>
        <h1 className="title">VS Battle Simulator</h1>
        <p className="subtitle">Choose two Pokémon to compare their power</p>
      </div>

      <div className="vs-arena">
        {/* Pokemon A */}
        <div className={`competitor-card glass-panel ${winner === 'A' ? 'winner' : ''}`}>
          <div className="competitor-select">
            <SearchableSelect 
              options={pokemonList} 
              value={selectedIdA} 
              onChange={setSelectedIdA} 
              placeholder="Select Pokémon 1" 
            />
          </div>
          
          {winner === 'A' && (
            <div className="winner-badge">🏆 WINNER</div>
          )}
          
          {loadingA ? (
            <div className="competitor-loading"><LoadingSpinner /></div>
          ) : detailsA ? (
            <div className="competitor-details animate-fade-in">
              <img 
                src={detailsA.sprites.other["official-artwork"].front_default || detailsA.sprites.front_default} 
                alt={detailsA.name} 
                className="competitor-image"
              />
              <h2 className="competitor-name">{detailsA.name}</h2>
              <div className="competitor-total">Total Stats: <strong>{totalA}</strong></div>
            </div>
          ) : (
            <div className="competitor-placeholder">
              <div className="placeholder-circle">?</div>
            </div>
          )}
        </div>

        {/* VS Badge */}
        <div className="vs-badge-container">
          <div className="vs-badge">VS</div>
        </div>

        {/* Pokemon B */}
        <div className={`competitor-card glass-panel ${winner === 'B' ? 'winner' : ''}`}>
          <div className="competitor-select">
            <SearchableSelect 
              options={pokemonList} 
              value={selectedIdB} 
              onChange={setSelectedIdB} 
              placeholder="Select Pokémon 2" 
            />
          </div>
          
          {winner === 'B' && (
            <div className="winner-badge">🏆 WINNER</div>
          )}
          
          {loadingB ? (
            <div className="competitor-loading"><LoadingSpinner /></div>
          ) : detailsB ? (
            <div className="competitor-details animate-fade-in">
              <img 
                src={detailsB.sprites.other["official-artwork"].front_default || detailsB.sprites.front_default} 
                alt={detailsB.name} 
                className="competitor-image"
              />
              <h2 className="competitor-name">{detailsB.name}</h2>
              <div className="competitor-total">Total Stats: <strong>{totalB}</strong></div>
            </div>
          ) : (
            <div className="competitor-placeholder">
              <div className="placeholder-circle">?</div>
            </div>
          )}
        </div>
      </div>

      {detailsA && detailsB && (
        <div className="comparison-section glass-panel animate-fade-in">
          <h3 className="comparison-title">
            {winner === 'A' ? `${detailsA.name} Wins!` : winner === 'B' ? `${detailsB.name} Wins!` : "It's a Tie!"}
          </h3>
          
          <div className="stats-comparison">
            {STAT_NAMES.map(statName => {
              const valA = getStatValue(detailsA, statName);
              const valB = getStatValue(detailsB, statName);
              const maxVal = Math.max(valA, valB, 150);
              
              return (
                <div key={statName} className="stat-comparison-row">
                  <div className={`stat-val-a ${valA > valB ? 'better' : ''}`}>{valA}</div>
                  <div className="stat-bar-container a-side">
                    <div className={`stat-fill a-fill ${valA > valB ? 'win-fill' : ''}`} style={{ width: `${(valA/maxVal)*100}%` }}></div>
                  </div>
                  
                  <div className="stat-label">{displayNames[statName]}</div>
                  
                  <div className="stat-bar-container b-side">
                    <div className={`stat-fill b-fill ${valB > valA ? 'win-fill' : ''}`} style={{ width: `${(valB/maxVal)*100}%` }}></div>
                  </div>
                  <div className={`stat-val-b ${valB > valA ? 'better' : ''}`}>{valB}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
