import React, { useEffect, useState } from "react";
import Modal from "../../shared/Modal";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import {
  Tree as ArboristTree,
  NodeApi,
  NodeRendererProps,
} from "react-arborist";
import { getLifecycleStateStyles } from "../../Tree/treeUtils";
import { useWizards } from "../../../providers/WizardController";
import { postMessage } from "../../../utils/postMessage";
import {
  CommandStructures,
  Commands,
} from "../../../../../commands/src/commands";
import Loader from "../../shared/Loader";
import { v4 as uuid } from "uuid";
import ITableData from "../../../interfaces/ITableData";
import "./DeleteWizard.css";
import { IconChevronDown, IconChevronRight } from "@nasa-jpl/react-stellar";
import { FillFlexParent } from "../../Tree/FillFlexParent";

const INDENT_STEP = 30;

function DeleteElementsWizard({
  labelArray,
  iriArray,
}: {
  labelArray?: string[];
  iriArray: string[];
}) {
  const [wizardId, setWizardId] = useState("");
  const [webviewPath, setWebviewPath] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [canDeleteElements, setCanDeleteElements] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [IRIsToDelete, setIRIsToDelete] = useState<ITableData[]>([]);
  const { closeWizard } = useWizards();

  useEffect(() => {
    const root = document.getElementById("root");
    let webviewPath = root?.getAttribute("data-webview-path") || "";
    setWebviewPath(webviewPath);

    const wizardId = uuid();
    setWizardId(wizardId);

    postMessage({
      command: Commands.GET_ELEMENT_RELATIONS,
      wizardId: wizardId,
      payload: {
        webviewPath: webviewPath,
        iriArray: iriArray,
      },
    });
    const handler = (event: MessageEvent) => {
      const message = event.data;
      // Only use messages that originated from the same wizard
      if (message.wizardId !== wizardId) return;

      let specificMessage;
      switch (message.command) {
        case Commands.LOADED_ELEMENT_RELATIONS:
          specificMessage =
            message as CommandStructures[Commands.LOADED_ELEMENT_RELATIONS];
          if (specificMessage.errorMessage) {
            console.error(specificMessage.errorMessage);
            setErrorMessage(specificMessage.errorMessage);
            setIsLoading(false);
            return;
          }
          try {
            const results = specificMessage.payload.IRIsToDelete;
            if (results) {
              setIRIsToDelete(results);
            } else {
              console.error("No IRI to delete!");
            }
          } catch (error) {
            let errorMessage = "";
            if (error instanceof SyntaxError) {
              errorMessage = `Failed to parse JSON data: ${error.message}`;
            } else {
              errorMessage = "Failed to parse JSON data: Invalid JSON format.";
            }

            // Send the error message back to the extension
            postMessage({
              command: Commands.ALERT,
              text: errorMessage,
            });
          }
          setIsLoading(false);
          break;
        case Commands.DELETED_ELEMENTS:
          specificMessage =
            message as CommandStructures[Commands.DELETED_ELEMENTS];
          const payload = specificMessage.payload;

          if (payload.success === true) {
            postMessage({ command: Commands.REFRESH_TABLE_DATA });
            // Usually takes about 750ms for refresh, so wait that long to deselect
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("deleteSuccess"));
            }, 750);
            closeWizard("DeleteElementsWizard");
          }
          setIsDeleting(false);
          break;
      }
    };
    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  const refetchRelations = () => {
    setIsLoading(true);
    postMessage({
      command: Commands.GET_ELEMENT_RELATIONS,
      wizardId,
      payload: {
        webviewPath,
        iriArray,
      },
    });
  };

  const onSubmit = () => {
    if (!IRIsToDelete) return;
    setIsDeleting(true);
    postMessage({
      command: Commands.EXECUTE_DELETE_ELEMENTS,
      wizardId,
      payload: {
        webviewPath: webviewPath,
        IRIsToDelete: IRIsToDelete,
      },
    });
  };

  return (
    <Modal
      className="h-fit w-3/5 max-w-3xl min-w-fit relative py-4 px-5"
      onClickOutside={() => !isDeleting && closeWizard("DeleteElementsWizard")}
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="flex w-full items-center justify-between mb-4">
          <h1 className="modal-wizard-header pl-2.5 text-[var(--vscode-foreground)]">
            Delete
          </h1>
          <button
            disabled={isDeleting}
            type="button"
            onClick={() => closeWizard("DeleteElementsWizard")}
            className="bg-transparent rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center text-[var(--vscode-icon-foreground)] hover:bg-[var(--vscode-toolbar-hoverBackground)]"
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close Modal</span>
          </button>
        </div>
        {!isLoading && !isDeleting && !errorMessage ? (
          <div className="justify-left text-xs w-full px-2.5 py-1.5">
            The following OML instances and relations will be deleted:
            <br />
            <a
              className="hover:underline text-[var(--vscode-charts-blue)] text-xxs w-full"
              href="http://www.opencaesar.io/oml/#Relations"
            >
              Please refer to the official OML docs to learn more about OML
              relations
            </a>
          </div>
        ) : (
          <div className="pt-4"></div>
        )}
        <div className="flex justify-center space-x-4 w-full px-2.5 pb-4">
          {isLoading || isDeleting ? (
            <Loader />
          ) : errorMessage ? (
            <p className="text-[color:var(--vscode-foreground)]">
              {errorMessage}
            </p>
          ) : (
            <div className="delete-tree-container flex w-full h-[40vh] overflow-y-auto overflow-x-hidden bg-[color:var(--vscode-panel-background)] rounded-md">
              <FillFlexParent headerHeight={0}>
                {(dimens) => (
                  <ArboristTree
                    {...dimens}
                    initialData={IRIsToDelete}
                    selectionFollowsFocus={true}
                    disableMultiSelection={true}
                    openByDefault={true}
                    className={"delete-tree"}
                    rowClassName={"row"}
                    rowHeight={38}
                    indent={INDENT_STEP}
                    overscanCount={8}
                    disableDrag={true}
                    disableEdit={true}
                  >
                    {Node}
                  </ArboristTree>
                )}
              </FillFlexParent>
            </div>
          )}
        </div>
        {!isLoading && !canDeleteElements && (
          <div className="flex justify-center text-center text-[var(--vscode-charts-red)] text-xxs w-full px-2.5 py-2.5">
            <strong>
              Elements can't be deleted, as some are either Baseline, Retracted,
              or Deprecated.
            </strong>
          </div>
        )}
        <div className="flex justify-between items-center space-x-4 w-full px-2.5 mt-4 mb-2.5">
          <div>
            {errorMessage !== "" && (
              <VSCodeButton
                appearance="primary"
                className="rounded-sm"
                onClick={refetchRelations}
              >
                Refetch Relations
                <span slot="start" className="codicon codicon-refresh"></span>
              </VSCodeButton>
            )}
          </div>
          <div className="flex space-x-4">
            <VSCodeButton
              disabled={isDeleting}
              appearance="secondary"
              type="button"
              onClick={() => closeWizard("DeleteElementsWizard")}
              className="rounded-sm bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]"
            >
              Cancel
            </VSCodeButton>
            <VSCodeButton
              className="rounded-sm bg-[var(--vscode-editorError-foreground)] hover:bg-[var(--vscode-errorForeground)]"
              onClick={onSubmit}
              disabled={
                isLoading ||
                isDeleting ||
                errorMessage !== "" ||
                !canDeleteElements
              }
            >
              Delete
              <span slot="start" className="codicon codicon-trash"></span>
            </VSCodeButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Node({ node, style, dragHandle }: NodeRendererProps<ITableData>) {
  const indentSize = Number.parseFloat(`${style.paddingLeft || 0}`);
  // const canDelete = node.data.canDelete ?? true;

  return (
    <div
      ref={dragHandle}
      style={style}
      // TODO: Handle nodes that can be deleted
      // className={`node ${canDelete ? "" : "opacity-50"}`}
      className={`node "opacity-100"}`}
    >
      <div className={"flex p-[var(--st-table-th-padding)] items-center"}>
        <div className={"indentLines"}>
          {new Array(indentSize / INDENT_STEP).fill(0).map((_, index) => {
            return <div key={index}></div>;
          })}
        </div>
        <FolderArrow
          onClick={() => node.isInternal && node.toggle()}
          node={node}
        />
        <div>
          <span>{node.data.name}</span>
        </div>
      </div>
    </div>
  );
}

function FolderArrow({
  node,
  onClick,
}: {
  node: NodeApi<ITableData>;
  onClick: () => void;
}) {
  return node.isInternal ? (
    <button
      {...{
        onClick: (e) => {
          e.stopPropagation();
          onClick();
        },
        className: "cursor-pointer",
      }}
    >
      {node.isOpen ? (
        <IconChevronDown
          className="pr-[8px] flex-shrink-0 flex-grow-0"
          color="white"
          width="20"
          height="20"
        />
      ) : (
        <IconChevronRight
          className="pr-[8px] flex-shrink-0 flex-grow-0"
          color="white"
          width="20"
          height="20"
        />
      )}
    </button>
  ) : null;
}

export default DeleteElementsWizard;
