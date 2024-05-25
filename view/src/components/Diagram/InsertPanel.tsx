import React, { ReactElement, useEffect, useRef } from "react";
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import invariant from "tiny-invariant";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Node from "reactflow"

interface InsertItemProps {
  label: string;
  style?: any;
}

const InstanceNode: React.FC<any> = (style) => {
  return (
    <div className="h-4 rounded ">

    </div>
  )
}

export const InstanceItem: React.FC<InsertItemProps> = ({ label, style }) => {
  // TODO: Use model's node color property instead of hard-coded color
  // TODO: handle onDrag Look at react-beautiful-dnd
  // TODO: handle cloning object after dragging
  // TODO: handle dropping object after letting go of the mouse
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    invariant(el);
    return draggable({element: el});
  }, []);

  return (
    <div className="flex flex-row items-center">
      <div className="relative left-[1px] z-10 h-2 w-2 border-[1px] rounded-full bg-black border-white "></div>
      <div className="flex flex-none justify-center items-center rounded h-11 w-24 bg-[#ff0000] z-0 " ref={ref}>
        <span className="text-center text-nowrap text-white text-[12px]">{label}</span>
      </div>
      <div className="relative right-[1px] z-10 h-2 w-2 border-[1px] rounded-full bg-black border-white"></div>
    </div>
  );
};

export const RelationItem: React.FC<InsertItemProps> = ({ label, style }) => {
  // TODO: handle onDrag Look at react-beautiful-dnd
  // TODO: handle cloning object after dragging
  // TODO: handle dropping object after letting go of the mouse
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    invariant(el);
    return draggable({element: el});
  }, []);

  return (
    <div className="flex flex-row justify-between bg-clip-text w-24" ref={ref}>
      <span className="text-center text-nowrap text-white text-[12px]">{label}</span>
      <span className="codicon codicon-arrow-right mr-2 text-[14px]"/>
    </div>
  );
};

export const InsertPane: React.FC<any> = ({ label, children }) => {
  // Refer to http://www.opencaesar.io/oml-tutorials/#tutorial1-create-oml-vocabulary
  return (
    <div className="p-2 rounded shadow-md bg-white/5 h-36">
      <span className="font-bold">{label}</span>
      <div className="flex flex-col h-28 items-center space-y-2 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export const InsertPanel: React.FC<any> = ({ children }) => {
  // Refer to http://www.opencaesar.io/oml-tutorials/#tutorial1-create-oml-vocabulary
  return (
    <div className="w-48 flex flex-col {`z-10 p-2 space-y-2 rounded shadow-md bg-[var(--vscode-banner-background)] overflow-y-auto max-h-[9rem]`}">
      {children}
    </div>
  );
};

export default InsertPanel;
