import type { FC } from "react";

interface TypeBadgeProps {
  type: string;
}

export const TypeBadge: FC<TypeBadgeProps> = ({ type }) => {
  return (
    <span
      className="type-badge"
      style={{ backgroundColor: `var(--type-${type.toLowerCase()}, #777)` }}
    >
      {type}
    </span>
  );
};
