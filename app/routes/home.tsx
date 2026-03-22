import { useLoaderData, useNavigation } from "react-router";
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

export async function loader() {
  // Fetch initial list of 150 Pokemon
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=150");
  const data = await response.json();

  // Fetch details for all 150 to get types and sprites
  // This might take a moment, so in a real app we'd paginate or use GraphQL
  const detailedPokemonPromises = data.results.map(async (pokemon: { name: string, url: string }) => {
    const res = await fetch(pokemon.url);
    const details = await res.json();
    return {
      id: details.id,
      name: details.name,
      types: details.types.map((t: any) => t.type.name),
      image: details.sprites.other["official-artwork"].front_default || details.sprites.front_default,
    };
  });

  const pokemonList = await Promise.all(detailedPokemonPromises);
  return { pokemonList };
}

export default function Home() {
  const { pokemonList } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  if (navigation.state === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className="home-page animate-fade-in">
      <div className="header-section">
        <h1 className="title">Gotta Catch 'Em All</h1>
        <p className="subtitle">Explore the original 150 Pokémon</p>
      </div>
      
      <div className="pokemon-grid">
        {pokemonList.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            id={pokemon.id}
            name={pokemon.name}
            types={pokemon.types}
            image={pokemon.image}
          />
        ))}
      </div>
    </div>
  );
}
