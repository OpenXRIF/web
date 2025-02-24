import { useMemo } from "react";
import { cn, getHighlightedLines } from "./lib/utils";
import HighlightedTextarea from "./HighlightedLines";

type JsonHighlighterProps = {
  /**
   * JSON object to highlight
   */
  obj: any;
  /**
   * Period separated path to the key to highlight (e.g. "actions.0.action")
   */
  path: string;
};

const JsonHighlighter = ({ obj, path }: JsonHighlighterProps) => {
  const { start, end, lines, str } = useMemo(() => {
    const str = JSON.stringify(obj, null, 2);
    return { ...getHighlightedLines(obj, path), str };
  }, [obj, path]);

  return <HighlightedTextarea start={start} end={end} text={str} />;
};

export default JsonHighlighter;
