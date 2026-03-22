import "./StatBar.css";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
}

export const StatBar = ({ label, value, max = 255 }: StatBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="stat-bar-container">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <div className="stat-track">
        <div 
          className="stat-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
