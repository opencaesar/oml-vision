import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../../shared/Modal";
import { VSCodeButton, VSCodeRadioGroup, VSCodeRadio, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { FormField } from '@nasa-jpl/react-stellar';
import { useWizards } from "../../../providers/WizardController";
import { CMStatesArray } from "../../../interfaces/CMStates";
import { postMessage } from '../../../utils/postMessage';
import { Commands } from "../../../../../commands/src/commands";
import { v4 as uuid } from 'uuid';
import { VSCodeNumberField } from "../../shared/VSCodeNumberField/VSCodeNumberField";

const DEFAULTS: Record<string, string> = {
  rdfs_label: "New Assembly",
  fse_hasAssemblyType: "BaseAssembly",
  fse_lifecycleState: "Proposed",
};

// steals properties displayed in the Properties Panel to show here
// @ts-ignore
// TODO: Have Property Data read from Git model in workspace
const propertyLayoutData = {
  pages: [
    {
      groups: [
        {
          controls: [
            {
              helpExpression: "A label can provide a human-readable id for model objects that have assigned ids that might be less readable",
              id: "id",
              label: "Label",
              type: "text"
            },
            {
              helpExpression: "A label can provide a human-readable id for model objects that have assigned ids that might be less readable",
              id: "id",
              label: "Radio",
              type: "radio"
            },
            {
              helpExpression: "A label can provide a human-readable id for model objects that have assigned ids that might be less readable",
              id: "id",
              label: "Number",
              type: "number"
            },
          ]
        }
      ]
    }
  ]
}
const properties = propertyLayoutData.pages.flatMap(page => page.groups.flatMap(group => group.controls)) as any[];
const WIZARD_ID = "CreateElementWizard";

function getPropertyById(key: string) {
  const property = properties.filter(prop => prop.id === key);
  return property.length > 0 ? property[0] : {};
}

function CreateElementWizard({ iriArray }: { iriArray: string[] }) {
  const { closeWizard } = useWizards();
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    properties.forEach(property =>
      setValue(property.id,
        property.id in DEFAULTS ? DEFAULTS[property.id] :
        property.id === 'aIri' || property.id.toLowerCase() === 'iri' ? `${iriArray[0].split('#')[0]}#${uuid()}` :
        ''
      )
    );
  }, [properties]);

  const onSubmit = (objectProperties: Record<string, string>) => {
    for (let key of Object.keys(objectProperties)) {
      const property = getPropertyById(key);
      if ('required' in property && property.required && objectProperties[key].length === 0) {
        postMessage({ command: Commands.ALERT, text: `${'label' in property ? property.label : key} is a required field.`});
        return;
      }
    }

    const parentRelation = iriArray[0].includes('Subsystem') ? 'base_aggregatedIn' : 'base_containedIn';
    const properties: Record<string, string[]> = { [parentRelation]: [iriArray[0]] };
    Object.keys(objectProperties).forEach( key => properties[key] = [objectProperties[key]] );

    postMessage({
      command: Commands.EXECUTE_CREATE_ELEMENTS,
      payload: {
        properties: properties,
        graph: iriArray[0].split('#')[0]
      }
    });
    closeWizard(WIZARD_ID);
  };

  return (
    <Modal
      className="h-fit w-3/4 max-w-3xl min-w-fit relative py-4 px-5"
      onClickOutside={() => closeWizard(WIZARD_ID)}
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="flex w-full items-center justify-between mb-4">
          <h1 className="modal-wizard-header pl-2.5 text-[var(--vscode-foreground)]">Create New Element</h1>
          <button type="button" onClick={() => closeWizard(WIZARD_ID)} className="bg-transparent rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center text-[var(--vscode-icon-foreground)] hover:bg-[var(--vscode-toolbar-hoverBackground)]">
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span className="sr-only">Create New Element</span>
          </button>
        </div>
        <div className="flex justify-center space-y-4 w-full px-2.5 py-4" style={{flexFlow: "column"}}>
          {properties.filter(property => 'type' in property && 'id' in property && 'label' in property).map(property => {
            property = property as {type: string, id: string, label: string, readOnly?: boolean, [key: string]: any}; // for TS sanity
            return (
              <FormField flow="vertical" className="w-full">
                <label>{property.label}</label>
                {property.type === "text" && (
                  <VSCodeTextField
                    className="vscode-input-rounded"
                    id={`createElementWizard_${property.id}`}
                    {...register(property.id)}
                  />
                )}
                {property.type === "radio" && (
                  <FormField flow="vertical" className="w-full">
                    <VSCodeRadioGroup {...register(property.id)}>
                      {CMStatesArray.map((state, idx) => (
                        <VSCodeRadio
                          key={idx}
                          value={state}
                          checked={idx===0}
                        >
                          {state}
                        </VSCodeRadio>
                      ))}
                    </VSCodeRadioGroup>
                  </FormField>
                )}
                {property.type === "number" && (
                <FormField flow="vertical" className="basis-9/12">
                  {/* FIXME: numberfield should render correct arrows */}
                  {/* @ts-ignore */}
                  <VSCodeNumberField
                    className="vscode-input-rounded"
                    readOnly={property.readOnly}
                    step={1}
                    pattern={/^\d*\.?\d{0,2}$/}
                    {...register(property.id, {
                      pattern: /^\d*\.?\d{0,2}$/,
                      onChange: onSubmit,
                    })}
                  />
                </FormField>
              )}
              </FormField>
            );
          })}
        </div>
        <div className="flex justify-end items-center space-x-4 w-full px-2.5 mt-4 mb-2.5">
          <VSCodeButton appearance="secondary" type="button" onClick={() => closeWizard(WIZARD_ID)} className="rounded-sm">Cancel</VSCodeButton>
          <VSCodeButton appearance="primary" className="rounded-sm" onClick={handleSubmit(onSubmit)}>
            Create Element
            <span slot="start" className={'codicon codicon-empty-window'}></span>
          </VSCodeButton>
        </div>
      </div>
    </Modal>
  );
}

export default CreateElementWizard;
