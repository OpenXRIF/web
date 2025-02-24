import React, { useState, useRef, useEffect } from "react";

type HighlightedTextareaProps = {
  start: number;
  end: number;
  text?: string;
};

const HighlightedTextarea = ({ start, end, text }) => {
  //   const [text, setText] = useState("");
  const textAreaRef = useRef(null);
  const highlightRef = useRef(null);

  const handleScroll = () => {
    highlightRef.current.scrollTop = textAreaRef.current.scrollTop;
  };

  useEffect(() => {
    textAreaRef.current.addEventListener("scroll", handleScroll);
    return () => {
      textAreaRef?.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    <div className="relative w-[600px] h-[400px] border border-gray-300 rounded-xl overflow-hidden font-mono">
      <div
        ref={highlightRef}
        className="absolute inset-0 overflow-hidden p-3 text-transparent pointer-events-none leading-[1.5]"
      >
        {renderHighlightedText()}
      </div>
      <textarea
        ref={textAreaRef}
        value={text}
        className="absolute inset-0 w-full h-full p-3 resize-none overflow-auto outline-none leading-[1.5]"
      />
    </div>
  );
};

export default HighlightedTextarea;
