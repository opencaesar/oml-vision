import React, { ReactElement, useEffect, useRef } from "react";
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import invariant from "tiny-invariant";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Node from "reactflow";

interface InstanceInsertItemProps {
  label: string;
  style?: string;
}

interface RelationInsertItemProps {
  label: string;
  icon: React.ReactElement
}

// A default icon for a RelationInsertItem
export const DefaultRelationIcon: React.ReactElement = <span className="codicon codicon-arrow-right mr-2 text-[20px]" />

/*
 * React component `InstanceInsertItem` is a visual representation of an insertable instance that a user can drag from the instance pane of the instance panel and drop into the diagram view.
 *
 * @param {string} label - String label for the instance
 * @param {string} style - TailwindCSS style to specify style attributes for the InstanceNode
 */
export const InstanceInsertItem: React.FC<InstanceInsertItemProps> = ({ label, style }) => {
  // TODO: Use model's node color property instead of hard-coded color
  // TODO: handle onDrag Look at react-beautiful-dnd
  // TODO: handle cloning object after dragging
  // TODO: handle dropping object after letting go of the mouse
  const ref = useRef(null); // ref for dragging
  const defaultNodeStyle = "bg-[#ff0000]"

  // Enable dragging of element
  useEffect(() => {
    const el = ref.current;
    invariant(el);
    return draggable({ element: el });
  }, []);

  return (
    <div className="flex flex-row items-center hover:backdrop-brightness-200">
      <div className="relative left-[1px] z-10 h-2 w-2 border-[1px] rounded-full bg-black border-white "></div>
      <div
        className={`flex flex-none justify-center items-center rounded h-11 w-24 z-0 ${style ?? defaultNodeStyle}`}
        ref={ref}
      >
        <span className="text-center text-nowrap text-white text-[12px]">
          {label}
        </span>
      </div>
      <div className="relative right-[1px] z-10 h-2 w-2 border-[1px] rounded-full bg-black border-white"></div>
    </div>
  );
};

export const RelationInsertItem: React.FC<RelationInsertItemProps> = ({ label, icon }) => {
  // TODO: Find a better way to handle icons
  const ref = useRef(null);
  
  useEffect(() => {
    const el = ref.current;
    invariant(el);
    return draggable({ element: el });
  }, []);

  return (
    <div className="flex flex-col items-start w-full pl-4">
      <div
        className="flex flex-row justify-between bg-clip-text w-24 hover:backdrop-brightness-100"
        ref={ref}
      >
        <span className="text-center text-nowrap text-white text-[12px]">
          {label}
        </span>
        {icon}
      </div>
    </div>
  );
};

export const InsertPane: React.FC<any> = ({ label, children }) => {
  // Refer to http://www.opencaesar.io/oml-tutorials/#tutorial1-create-oml-vocabulary
  return (
    <div className="p-2 rounded shadow-md bg-white/5 h-36">
      <div className="pb-2">
        <span className="font-bold">{label}</span>
      </div>
      <div className="flex flex-col h-24 items-center space-y-2 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export const InsertPanel: React.FC<any> = ({ children }) => {
  return (
    <div className="w-48 flex flex-col {`z-10 p-2 space-y-2 rounded shadow-md bg-[var(--vscode-banner-background)] overflow-y-auto max-h-[9rem]`}">
      {children}
    </div>
  );
};

export default InsertPanel;
