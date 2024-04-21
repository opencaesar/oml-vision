import React, { ReactElement } from "react";

interface InsertItemProps {
    label: string;
    onItemClicked: () => void;
    icon: ReactElement<any>;
}

const InsertItem: React.FC<InsertItemProps> = ({ label, onItemClicked, icon }) => {
    return (
        <div onClick={ onItemClicked } className="flex flex-row">
            <span className="text-[10px]">{ label }</span>
            { icon }
        </div>
    )
}

interface InsertPanelProps {
    components: InsertItemProps[];
    relationships: InsertItemProps[];
}

const InsertPanel: React.FC<InsertPanelProps> = ({ components, relationships }) => {
    return (
        <div className="flex flex-col {`z-10 p-2 space-y-2 rounded shadow-md bg-[var(--vscode-banner-background)] overflow-y-auto max-h-[9rem]`}">
            <span className="font-bold">Components</span>
            <div className="pl-4 border-solid border-2 ">
                {components.map((component, index) => (
                    <InsertItem 
                    label={component.label} 
                    onItemClicked={component.onItemClicked}
                    icon={component.icon} />
                ))}
            </div>
            <span className="">Relationships</span>
            {relationships.map((relationship, index) => (
                <InsertItem 
                label={relationship.label} 
                onItemClicked={relationship.onItemClicked}
                icon={relationship.icon} />
            ))}
        </div>
    );
}

export default InsertPanel;