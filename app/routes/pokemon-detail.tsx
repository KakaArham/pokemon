import { useLoaderData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/pokemon-detail";
import { TypeBadge } from "../components/TypeBadge";
import { StatBar } from "../components/StatBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "./pokemon-detail.css";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Pokédex - ${data?.pokemon.name || "Details"}` },
    { name: "description", content: `Details for ${data?.pokemon.name}` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { name } = params;

  // Fetch basic details
  const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!pokemonRes.ok) throw new Error("Pokemon not found");
  const pokemonData = await pokemonRes.json();

  // Fetch species details for description
  const speciesRes = await fetch(pokemonData.species.url);
  const speciesData = await speciesRes.json();

  // Find English flavor text
  const flavorTextEntry = speciesData.flavor_text_entries.find(
    (entry: any) => entry.language.name === "en"
  );
  const description = flavorTextEntry 
    ? flavorTextEntry.flavor_text.replace(/\f/g, " ") 
    : "No description available.";

  return {
    pokemon: {
      id: pokemonData.id,
      name: pokemonData.name,
      height: pokemonData.height / 10, // convert dm to m
      weight: pokemonData.weight / 10, // convert hg to kg
      types: pokemonData.types.map((t: any) => t.type.name),
      stats: pokemonData.stats.map((s: any) => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      image: pokemonData.sprites.other["official-artwork"].front_default || pokemonData.sprites.front_default,
      description,
    }
  };
}

export default function PokemonDetail() {
  const { pokemon } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  if (navigation.state === "loading") {
    return <LoadingSpinner />;
  }

  const primaryType = pokemon.types[0].toLowerCase();
  
  // Clean up stat names for display
  const formatStatName = (name: string) => {
    const statMap: Record<string, string> = {
      hp: "HP",
      attack: "ATK",
      defense: "DEF",
      "special-attack": "Sp.A",
      "special-defense": "Sp.D",
      speed: "SPD"
    };
    return statMap[name] || name;
  };

  return (
    <div 
      className="pokemon-detail-page animate-fade-in"
      style={{ '--detail-tint': `var(--type-${primaryType})` } as React.CSSProperties}
    >
      <Link to="/" className="back-link glass-panel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back to Pokédex
      </Link>

      <div className="detail-container glass-panel">
        <div className="hero-section">
          <div className="hero-bg-glow" />
          <img 
            src={pokemon.image} 
            alt={pokemon.name} 
            className="hero-image"
          />
        </div>

        <div className="info-section">
          <div className="header-info">
            <span className="id-badge">#{pokemon.id.toString().padStart(3, '0')}</span>
            <h1 className="pokemon-title">{pokemon.name}</h1>
            <div className="types-container">
              {pokemon.types.map((type: string) => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </div>

          <p className="flavor-text">{pokemon.description}</p>

          <div className="physical-stats">
            <div className="phys-stat">
              <span className="phys-label">Height</span>
              <span className="phys-value">{pokemon.height} m</span>
            </div>
            <div className="phys-divider" />
            <div className="phys-stat">
              <span className="phys-label">Weight</span>
              <span className="phys-value">{pokemon.weight} kg</span>
            </div>
          </div>

          <div className="base-stats">
            <h3 className="section-title">Base Stats</h3>
            <div className="stats-list">
              {pokemon.stats.map((stat: any) => (
                <StatBar 
                  key={stat.name}
                  label={formatStatName(stat.name)}
                  value={stat.value}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
