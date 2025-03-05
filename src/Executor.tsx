import { useXrifStore } from "./store";

export const Executor = () => {
  const executeAction = useXrifStore((state) => state.executeAction);

  return (
    <div>
      <button onClick={executeAction}>Execute Action</button>
    </div>
  );
};
