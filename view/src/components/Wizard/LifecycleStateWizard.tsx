import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../shared/Modal";
import { VSCodeButton, VSCodeRadioGroup, VSCodeRadio } from "@vscode/webview-ui-toolkit/react";
import { CMState, CMStatesArray } from "../../interfaces/CMStates";
import { useWizards } from "../../providers/WizardController";
import { postMessage } from "../../utils/postMessage";
import { Commands } from "../../../../commands/src/commands";


function LifecycleStateWizard({
  iriArray,
  currentState,
}: {
  iriArray: string[],
  currentState: CMState | null
}) {
  const { closeWizard } = useWizards();
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (currentState && CMStatesArray.includes(currentState)) {
      setValue("lifecycleState", currentState);
    }
  }, [currentState]);

  const onSubmit = (state: any) => {
    postMessage({
      command: Commands.UPDATE_CM_STATE,
      payload: iriArray.map(aIri => {
        return {aIri, fse_lifecycleState: state.lifecycleState};
      })
    });
    // TODO: handle submit

    closeWizard("LifecycleStateWizard");
  };

  return (
    <Modal
      className="h-fit w-3/5 max-w-3xl min-w-fit relative py-4 px-5"
      onClickOutside={() => closeWizard("LifecycleStateWizard")}
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="flex w-full items-center justify-between mb-4">
          <h1 className="modal-wizard-header pl-2.5 text-[var(--vscode-foreground)]">Change CM State</h1>
          <button type="button" onClick={() => closeWizard("LifecycleStateWizard")} className="bg-transparent rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center text-[var(--vscode-icon-foreground)] hover:bg-[var(--vscode-toolbar-hoverBackground)]">
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span className="sr-only">Close Modal</span>
          </button>
        </div>
        <div className="flex justify-center space-x-4 w-full px-2.5 py-4">
          <VSCodeRadioGroup {...register("lifecycleState")}>
            {CMStatesArray.map((state, idx) => (
              <VSCodeRadio
                key={idx}
                value={state}
              >
                {state}
              </VSCodeRadio>
            ))}
          </VSCodeRadioGroup>
        </div>
        <div className="flex justify-end items-center space-x-4 w-full px-2.5 mt-4 mb-2.5">
          <VSCodeButton appearance="secondary" type="button" onClick={() => closeWizard("LifecycleStateWizard")} className="rounded-sm">Cancel</VSCodeButton>
          <VSCodeButton appearance="primary" className="rounded-sm" onClick={handleSubmit(onSubmit)}>
            Submit
            <span slot="start" className={`codicon codicon-${iriArray.length === 1 ? "check" : "check-all"}`}></span>
          </VSCodeButton>
        </div>
      </div>
    </Modal>
  );
}

export default LifecycleStateWizard;
