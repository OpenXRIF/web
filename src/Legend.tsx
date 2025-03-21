import { LEGEND_MAP } from "./E7";

export const Legend = () => {
  const data = LEGEND_MAP;

  return (
    <div className="text-left gap-0 text-sm min-w-50">
      {data.entries().map(([key, value]) => (
        <div key={key} className="flex">
          <span className="w-5 text-blue-500">{key}</span><span>{value}</span>
        </div>
      ))}
    </div>
  );
};
