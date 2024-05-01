import React, { ReactElement } from "react";
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import { Button } from "@nasa-jpl/react-stellar";

interface InsertItemProps {
  label: string;
  icon: ReactElement<any>;
  onItemClicked(): void;
}

const InsertItem: React.FC<InsertItemProps> = ({
  label,
  icon,
  onItemClicked,
}) => {
  // TODO: handle onDrag Look at react-beautiful-dnd
  // TODO: handle cloning object after dragging
  // TODO: handle dropping object after letting go of the mouse
  let handleItemClick;
  return (
    <div
      onDrag={onItemClicked}
      onClick={onItemClicked}
      className="flex flex-row flex-grow justify-between"
    >
      <Button className="flex-grow" variant="secondary" onClick={() => console.log("Click")}>
        <div className="flex-auto w-24 text-left">
            {label}
        </div>
        <div className="grow-0">
            {icon}
        </div>
      </Button>
    </div>
  );
};

interface InsertPanelProps {
  components: InsertItemProps[];
  relationships: InsertItemProps[];
}

const InsertPanel: React.FC<InsertPanelProps> = ({
  components,
  relationships,
}) => {
  // TODO: Remame components to instances
  // TODO: Remame relationships to relations
  // Refer to http://www.opencaesar.io/oml-tutorials/#tutorial1-create-oml-vocabulary
  return (
    <div className="w-48 flex flex-col {`z-10 p-2 space-y-2 rounded shadow-md bg-[var(--vscode-banner-background)] overflow-y-auto max-h-[9rem]`}">
      <span className="font-bold">Components</span>
      <div className="pl-4 h-24 flex flex-col flex-grow {`z-10 p-2 space-y-2 rounded shadow-md bg-[var(--vscode-banner-background)] overflow-y-auto max-h-[9rem]`}">
        {relationships.map((component, index) => (
            <InsertItem
            label={component.label}
            onItemClicked={component.onItemClicked}
            icon={component.icon}
            />
        ))}
      </div>
      <span className="font-bold">Relationships</span>
      {relationships.map((relationship, index) => (
        <InsertItem
          label={relationship.label}
          onItemClicked={relationship.onItemClicked}
          icon={relationship.icon}
        />
      ))}
    </div>
  );
};

export default InsertPanel;
