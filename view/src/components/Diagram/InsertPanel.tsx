import React, { ReactElement, useEffect, useRef } from "react";
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import { Button } from "@nasa-jpl/react-stellar";
import invariant from "tiny-invariant"
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

interface InsertItemProps {
  label: string;
  icon: ReactElement<any>;
}

const InsertItem: React.FC<InsertItemProps> = ({
  label,
  icon,
}) => {
  // TODO: Use model's node color property instead of hard-coded color
  // TODO: handle onDrag Look at react-beautiful-dnd
  // TODO: handle cloning object after dragging
  // TODO: handle dropping object after letting go of the mouse
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
    });
  }, []);
  return (
    <div
      className="flex flex-row flex-grow justify-between rounded p-1 bg-[#ff0000]"
      ref={ref}
    >
      <div className="flex-auto w-24 text-left text-nowrap">
        {label}
      </div>
      <div className="grow-0">
        {icon}
      </div>
    </div>
  );
};

interface InsertPanelProps {
  instances: InsertItemProps[];
  relations: InsertItemProps[];
}

const InsertPanel: React.FC<InsertPanelProps> = ({
  instances,
  relations,
}) => {
  // Refer to http://www.opencaesar.io/oml-tutorials/#tutorial1-create-oml-vocabulary
  return (
    <div>
      <SubPanel label="Instances" items={instances}/>
      <SubPanel label="Relations" items={relations}/>
    </div>
  );
};

const SubPanel: React.FC<any> = ({
  label,
  items
}) => {
  // Refer to http://www.opencaesar.io/oml-tutorials/#tutorial1-create-oml-vocabulary
  return (
    <div className="w-48 flex flex-col {`z-10 px-2 pt-2 space-y-2 rounded shadow-md bg-[var(--vscode-banner-background)] overflow-y-auto max-h-[9rem]`}">
      <div className="p-2 rounded shadow-md bg-white/5 max-h-[9rem]">
        <span className="font-bold">{label}</span>
        <div className="pl-2 h-24 flex flex-col flex-grow {`z-10 p-2 space-y-2 overflow-y-auto max-h-[9rem]`}">
          {items.map((item: InsertItemProps) => (
              <InsertItem
              label={item.label}
              icon={item.icon}
              />
          ))}
        </div>
      </div>
    </div>
  );
};



export default InsertPanel;
