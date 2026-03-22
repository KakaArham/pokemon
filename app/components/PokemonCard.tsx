import { Link } from "react-router";
import { TypeBadge } from "./TypeBadge";
import "./PokemonCard.css";

interface PokemonCardProps {
  id: number;
  name: string;
  types: string[];
  image: string;
}

export const PokemonCard = ({ id, name, types, image }: PokemonCardProps) => {
  // Use the first type for a subtle background tint
  const primaryType = types[0].toLowerCase();

  return (
    <Link 
      to={`/pokemon/${name}`} 
      className="pokemon-card glass-panel"
      style={{ '--card-tint': `var(--type-${primaryType})` } as React.CSSProperties}
    >
      <div className="pokemon-card-bg-circle" />
      <span className="pokemon-id">#{id.toString().padStart(3, '0')}</span>
      <img
        src={image}
        alt={name}
        className="pokemon-sprite"
        loading="lazy"
      />
      <h2 className="pokemon-name">{name}</h2>
      <div className="pokemon-types">
        {types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
    </Link>
  );
};
