import { LEGEND_MAP } from "./E7";

export const Legend = () => {
  const data = LEGEND_MAP;

  return (
    <div>
      <h2>Legend</h2>
      <p>Legend content</p>
      {data.entries().map(([key, value]) => (
        <div key={key}>
          <span>{key}</span>
          -
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
};
