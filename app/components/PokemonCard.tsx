import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { TypeBadge } from "./TypeBadge";
import "./PokemonCard.css";

interface PokemonCardProps {
  id: number;
  name: string;
  image: string;
}

export const PokemonCard = ({ id, name, image }: PokemonCardProps) => {
  const [types, setTypes] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Only observe if we haven't fetched yet
    if (!cardRef.current || isVisible) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    // Fetch individual types on the client securely only when card is in view
    let mounted = true;
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then(res => res.json())
      .then(data => {
        if (mounted) {
          setTypes(data.types.map((t: any) => t.type.name));
        }
      })
      .catch(console.error);
      
    return () => { mounted = false; };
  }, [id, isVisible]);

  const primaryType = types.length > 0 ? types[0].toLowerCase() : "normal";

  return (
    <Link 
      to={`/pokemon/${name}`} 
      className="pokemon-card glass-panel"
      ref={cardRef}
      style={{ '--card-tint': types.length > 0 ? `var(--type-${primaryType})` : 'transparent' } as React.CSSProperties}
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
      {types.length > 0 && (
        <div className="pokemon-types">
          {types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      )}
    </Link>
  );
};
