import React from "react";
import "./Diagram.css";

interface ColorBoxProps {
  color: string;
  isEdge: boolean;
}

const ColorBox: React.FC<ColorBoxProps> = ({ color, isEdge }) => {
  return isEdge ? (
    <span className="codicon codicon-arrow-right mr-2 text-[14px]" style={{ color }} />
  ) : (
    <div className="w-3 h-3 mr-2 rounded" style={{ backgroundColor: color }} />
  );
};

interface LegendItemProps {
  color: string;
  label: string;
  isEdge: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, isEdge }) => (
  <div className="flex items-center text-[var(--vscode-editor-foreground)]">
    <ColorBox color={color} isEdge={isEdge} />
    <span>{label}</span>
  </div>
);

interface LegendProps {
  items: LegendItemProps[];
}

const Legend: React.FC<LegendProps> = ({ items }) => {
  return (
    <div className={`legend-container scrollable z-10 p-2 space-y-2 rounded shadow-md bg-[var(--vscode-banner-background)] overflow-y-auto max-h-[9rem]`}>
      {items.map((item, index) => (
        <LegendItem key={index} color={item.color} label={item.label} isEdge={item.isEdge} />
      ))}
    </div>
  );
}

export default Legend;