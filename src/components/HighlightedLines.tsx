import { useRef, useEffect } from "react";

type HighlightedTextareaProps = {
  start: number;
  end: number;
  text?: string;
};

const HighlightedTextarea = ({
  start,
  end,
  text = "",
}: HighlightedTextareaProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (highlightRef.current && textAreaRef.current) {
      highlightRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      textAreaRef?.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (highlightRef.current && start !== undefined && end !== undefined) {
      const lines = text.split("\n");
      const lineHeight = parseFloat(
        getComputedStyle(highlightRef.current).lineHeight || "1.5"
      );
      const scrollToPosition = Math.max(0, start * lineHeight);
      highlightRef.current.scrollTop = scrollToPosition;
      if (textAreaRef.current) {
        textAreaRef.current.scrollTop = scrollToPosition;
      }
    }
  }, [start, end, text]);

  const renderHighlightedText = () => {
    return text.split("\n").map((line, index) => (
      <div
        key={index}
        className={`whitespace-pre ${
          start && end && index >= start && index <= end
            ? "bg-yellow-500 border-l-4 border-yellow-200"
            : ""
        }`}
      >
        {line || " "}
      </div>
    ));
  };

  return (
    <div className="relative w-full min-h-80 h-full">
      <div
        ref={highlightRef}
        className="absolute inset-0 overflow-hidden p-3 text-transparent pointer-events-none leading-[1.5]"
      >
        {renderHighlightedText()}
      </div>
      <textarea
        readOnly
        ref={textAreaRef}
        value={text}
        className="absolute inset-0 w-full h-full p-3 resize-none overflow-auto outline-none leading-[1.5]"
      />
    </div>
  );
};

export default HighlightedTextarea;
