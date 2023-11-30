import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { FormField } from "@nasa-jpl/react-stellar";
import { v4 as uuidv4 } from "uuid";
import Modal from "../../shared/Modal";
import { useWizards } from "../../../contexts/WizardController";
import { postMessage } from "../../../utils/postMessage";
import { CommandStructures, Commands } from "../../../../../commands/src/commands";

function CreateFaultContainmentRegionWizard({
  iriArray,
}: {
  iriArray: string[]
}) {
  const { closeWizard } = useWizards();
  const [isCreating, setIsCreating] = useState(false);
  const [wizardId, setWizardId] = useState("");
  const [tablePath, setTablePath] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onSubmit', reValidateMode: 'onBlur' });

  useEffect(() => {
    const root = document.getElementById("root");
    let tablePath = root?.getAttribute("data-table-path") || "";
    setTablePath(tablePath);

    const wizardId = uuidv4();
    setWizardId(wizardId);

    const handler = (event: MessageEvent) => {
      const message = event.data;
      // Only use messages that originated from the same wizard
      if (message.wizardId !== wizardId) return;

      let specificMessage;
      switch (message.command) {
        case Commands.CREATED_ELEMENT:
          specificMessage = message as CommandStructures[Commands.CREATED_ELEMENT];
          const payload = specificMessage.payload;
          if (payload.success === true) {
            postMessage({ command: Commands.REFRESH_TABLE_DATA });
            closeWizard("CreateFaultContainmentRegionWizard");
          }
          setIsCreating(false);
          break;
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, [])

  const onSubmit = (state: any) => {
    postMessage({
      command: Commands.CREATE_FCR,
      wizardId,
      payload: {
        tablePath,
        assemblies: iriArray,
        properties: state
      }
    });
    closeWizard("CreateFaultContainmentRegionWizard");
  };

  return (
    <Modal
      className="h-fit w-3/5 max-w-3xl min-w-fit relative py-4 px-5"
      onClickOutside={() => closeWizard("CreateFaultContainmentRegionWizard")}
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="flex w-full items-center justify-between mb-4">
          <h1 className="modal-wizard-header pl-2.5 text-[var(--vscode-foreground)]">Create FCR</h1>
          <button type="button" onClick={() => closeWizard("CreateFaultContainmentRegionWizard")} className="bg-transparent rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center text-[var(--vscode-icon-foreground)] hover:bg-[var(--vscode-toolbar-hoverBackground)]">
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span className="sr-only">Close Modal</span>
          </button>
        </div>
        <div className="flex flex-col justify-center space-y-4 w-full px-2.5 py-4">
          <FormField flow="vertical" className="required">
            <label className="pb-1 text-left text-[var(--vscode-foreground)]">
              Name
            </label>
            <VSCodeTextField className={`vscode-input-rounded ${errors.fp_hasFcrName && "required-field-empty"}`} placeholder='Ex. Power Bus FCR' {...register("fp_hasFcrName", { required: true })} />
          </FormField>
          <FormField flow="vertical" className="required">
            <label className="pb-1 text-left text-[var(--vscode-foreground)]">
              Description
            </label>
            <VSCodeTextField className={`vscode-input-rounded ${errors.fp_hasFcrDescription && "required-field-empty"}`} placeholder='Describe the containment region' {...register("fp_hasFcrDescription", { required: true })} />
          </FormField>
          <FormField flow="vertical" className="required">
            <label className="pb-1 text-left text-[var(--vscode-foreground)]">
              Rationale
            </label>
            <VSCodeTextField className={`vscode-input-rounded ${errors.fp_hasFcrRationale && "required-field-empty"}`} placeholder='Explain how isolation was verified' {...register("fp_hasFcrRationale", { required: true })} />
          </FormField>
        </div>
        <div className="flex justify-end items-center space-x-4 w-full px-2.5 mt-4 mb-2.5">
          <VSCodeButton appearance="secondary" type="button" onClick={() => closeWizard("CreateFaultContainmentRegionWizard")} className="rounded-sm">Cancel</VSCodeButton>
          <VSCodeButton appearance="primary" className="rounded-sm" onClick={handleSubmit(onSubmit)}>
            Create
            <span slot="start" className={`codicon codicon-empty-window`}></span>
          </VSCodeButton>
        </div>
      </div>
    </Modal>
  );
}

export default CreateFaultContainmentRegionWizard;