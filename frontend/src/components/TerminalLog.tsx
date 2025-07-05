import React from "react";

interface TerminalLogProps {
  log: string;
}

const TerminalLog: React.FC<TerminalLogProps> = ({ log }) => {
  return (
    <div className="bg-black text-green-400 text-sm p-2 rounded mt-4 border border-gray-700 font-mono whitespace-pre-wrap">
      {log}
    </div>
  );
};

export default TerminalLog; 