import "./LoadingSpinner.css";

export const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="pokeball-spinner">
        <div className="pokeball-spinner-button"></div>
      </div>
      <p className="spinner-text">Loading...</p>
    </div>
  );
};
