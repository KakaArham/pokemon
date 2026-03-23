import { useLoaderData, useNavigation, Link } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/home";
import { PokemonCard } from "../components/PokemonCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import "./home.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pokédex - Home" },
    { name: "description", content: "A premium Pokédex application" },
  ];
}

export async function clientLoader() {
  // Reduce initial load for mobile and avoid heavy simultaneous SVGs on iOS.
  const limit = 90;
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const data = await response.json();

    const pokemonList = data.results.map((pokemon: { name: string, url: string }) => {
      // Extract ID from url, e.g., https://pokeapi.co/api/v2/pokemon/1/
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
    console.error("Home loader fetch failed:", error);
    return { pokemonList: [] };
  }
}

export function HydrateFallback() {
  return <LoadingSpinner />;
}

export default function Home() {
  const { pokemonList } = useLoaderData<typeof clientLoader>();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  // Removed the navigation.state === "loading" check to prevent layout jump

  const filteredPokemon = pokemonList.filter((pokemon: { name: string }) => 
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-page animate-fade-in">
      <div className="header-section">
        <h1 className="title">Gotta Catch 'Em All</h1>
        <p className="subtitle">Explore the original 150 Pokémon</p>
        
        <div className="vs-button-container" style={{ marginTop: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <Link to="/vs" className="vs-link glass-panel" style={{ padding: '0.6rem 1.5rem', borderRadius: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)', textDecoration: 'none', background: 'linear-gradient(135deg, rgba(239, 83, 80, 0.15), rgba(118, 215, 196, 0.15))', border: '1px solid rgba(255, 255, 255, 0.2)', transition: 'all 0.3s ease' }}>
            <span style={{color: '#ff5353', fontSize: '1.2rem'}}>⚔️</span>
            VS Battle Mode
          </Link>
        </div>
        
        <div className="search-container">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="search-input glass-panel" 
            placeholder="Search Pokémon by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredPokemon.length === 0 ? (
        <div className="no-results">
          <p>No Pokémon found matching "{searchQuery}".</p>
        </div>
      ) : (
        <div className="pokemon-grid">
          {filteredPokemon.map((pokemon: { id: number; name: string; image: string }) => (
            <PokemonCard
              key={pokemon.id}
              id={pokemon.id}
              name={pokemon.name}
              image={pokemon.image}
            />
          ))}
        </div>
      )}
    </div>
  );
}
