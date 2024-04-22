import React, { useEffect, useState, useRef, KeyboardEvent } from "react";
import { IconPlus, IconMinus, FormField } from "@nasa-jpl/react-stellar";
import {
  VSCodeTextField,
  VSCodeRadioGroup,
  VSCodeRadio,
} from "@vscode/webview-ui-toolkit/react";
import { useForm, FieldValues } from "react-hook-form";
import { parse, EvalAstFactory } from "jexpr";
import { postMessage } from "../utils/postMessage";
import { usePropertiesData } from "../contexts/PropertyDataProvider";
import ITableData from "../interfaces/ITableData";
import { PropertyPage } from "../interfaces/PropertyLayoutsType";
import { CMStatesArray } from "../interfaces/CMStates";
import { IDisplayGroup } from "../interfaces/IDisplayGroup";
import HelpIcon from "./shared/HelpIcon";
import Loader from "./shared/Loader";
import { CommandStructures, Commands } from "../../../commands/src/commands";
import { VSCodeNumberField } from "./shared/VSCodeNumberField/VSCodeNumberField";

const astFactory = new EvalAstFactory();
const isDataEmpty = (obj: Object) => Object.keys(obj).length === 0;

const PropertySheet: React.FC<{ page: PropertyPage }> = ({ page }) => {
  const { rowIri, tableRowTypes, isAvailable } = usePropertiesData();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentData, setCurrentData] = useState<ITableData>({});
  const [displayGroups, setDisplayGroups] = useState<IDisplayGroup[]>([]);
  // Initialize a state array with true for each section to default to open
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // only let the page control the layout of tableRow is available
  // (tableRow existing means we have a row with data that we want to fetch)
  const layoutData = isAvailable && page ? page : null;

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;

      let specificMessage;
      if (message.command === Commands.LOADED_PROPERTY_SHEET) {
        specificMessage =
          message as CommandStructures[Commands.LOADED_PROPERTY_SHEET];
        if (specificMessage.errorMessage) {
          console.error(specificMessage.errorMessage);
          setErrorMessage(specificMessage.errorMessage);
          setIsLoading(false);
          return;
        }

        try {
          const results = specificMessage.payload;

          if (!results || typeof results !== "object") {
            throw new Error("Invalid JSON format: expected an object");
          }

          const sparqlData = results || [];
          const omlData = sparqlData.length > 0 ? sparqlData[0] : {};
          setCurrentData(omlData);
        } catch (error) {
          let errorMessage = "";
          if (error instanceof SyntaxError) {
            errorMessage = `Failed to parse JSON data: ${error.message}`;
          } else {
            errorMessage = `Failed to parse JSON data: Invalid format.`;
          }

          // Send the error message back to the extension
          postMessage({
            command: Commands.ALERT,
            text: errorMessage,
          });
        }

        setIsLoading(false);
      }
    };
    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  /* This is the effect that dynamically queries the property data
     AND evaluates which groups to display for the current page */
  useEffect(() => {
    if (isAvailable) {
      const hasIri = rowIri && rowIri.length;
      if (!hasIri) {
        setErrorMessage("Error: IRI not found.");
        setIsLoading(false);
        return;
      }

      // Generate displayGroups based on current tableRowTypes
      const evaluatedExpressions = page.groups
        .filter((group) => group.displayExpression)
        .map((expression) => {
          let display: boolean;
          try {
            const expr = parse(expression.displayExpression!, astFactory);
            if (!expr) {
              throw new Error(
                `Invalid expression: ${expression.displayExpression}`
              );
            }
            display = expr.evaluate({ tableRowTypes });
          } catch (error) {
            console.error(
              `Failed to evaluate display expression for group ${expression.id}: ${error}`
            );
            display = false;
          }

          // Return an object that matches the DisplayGroup interface
          return {
            id: expression.id,
            display,
          };
        });
      setDisplayGroups(evaluatedExpressions);

      postMessage({
        command: Commands.GENERATE_PROPERTY_SHEET,
        payload: {
          queryName: page.sparqlQuery,
          iri: rowIri,
        },
      });
    }
  }, [rowIri, tableRowTypes, isAvailable]);

  useEffect(() => {
    if (layoutData) {
      // Update isOpen array when layoutData changes
      setIsOpen(Array(layoutData.groups.length).fill(true));

      // Prepopulate form fields
      Object.keys(currentData).forEach((key) => {
        setValue(key, currentData[key]);
      });
    }
  }, [layoutData, setValue, currentData]);

  const handleToggle = (index: number) => {
    const newIsOpen = [...isOpen];
    newIsOpen[index] = !newIsOpen[index];
    setIsOpen(newIsOpen);
  };

  const onSubmit = (data: FieldValues) => {
    if (page) {
      postMessage({
        command: Commands.UPDATE_QUERY,
        selectedElements: [rowIri],
        query: page.sparqlUpdate,
        before_parameters: currentData,
        after_parameters: data,
      });
    }
    return false;
  };

  const submitForm = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const blurIfReturned = (event: KeyboardEvent) => {
    if (event.key === "Enter" && event.target instanceof HTMLElement) {
      (event.target as HTMLElement).blur();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center">
        <Loader
          message={`Loading ${page.label.toLowerCase()} property sheet...`}
        />
      </div>
    );
  }

  return (
    <form className="w-full" ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      {!layoutData ||
      !layoutData.groups.length ||
      isDataEmpty(currentData) ||
      errorMessage ? (
        <div className="h-screen flex justify-center items-center">
          <p className="text-[color:var(--vscode-foreground)]">
            {errorMessage
              ? errorMessage
              : "Uh oh, no editable properties found!"}
          </p>
        </div>
      ) : (
        <div className="pb-4">
          {layoutData.groups.map((group, index) => {
            // Checks if this group is in displayGroups. If it is, we use the display prop (true/false)
            // If not, we default to true because only groups with displayExpressions are optionally displayed
            const groupInDisplayGroups = displayGroups.find(
              (x) => x.id == group.id
            );
            const isConditionalGroup = group.displayExpression;
            // If groupInDisplayGroups not found, ONLY display group if it is not a conditional group (ex. Instance, etc.)
            const shouldDisplay = groupInDisplayGroups
              ? groupInDisplayGroups.display
              : !isConditionalGroup;

            if (shouldDisplay) {
              return (
                <div key={index} className="w-full px-4 pt-4">
                  <button
                    className={`
                    flex items-center w-full px-2 py-1 rounded
                    bg-[color:var(--vscode-list-dropBackground)]
                    hover:text-[color:var(--vscode-list-activeSelectionForeground)]
                    active:bg-[color:var(--vscode-list-activeSelectionBackground)]`}
                    onClick={() => handleToggle(index)}
                  >
                    {isOpen[index] ? (
                      <IconMinus
                        className="pr-[8px] flex-shrink-0 flex-grow-0 text-[color:var(--vscode-foreground)]"
                        width="20"
                        height="20"
                      />
                    ) : (
                      <IconPlus
                        className="pr-[8px] flex-shrink-0 flex-grow-0 text-[color:var(--vscode-foreground)]"
                        width="20"
                        height="20"
                      />
                    )}
                    {group.label}
                  </button>
                  {isOpen[index] && (
                    <div className="mx-3 mt-4">
                      {group.controls.map((control, idx) => (
                        <div
                          className="flex items-center my-2 min-w-fit"
                          key={idx}
                        >
                          <label className="basis-2/12 text-[color:var(--vscode-foreground)]">
                            {control.label}
                          </label>
                          <div className="basis-1/12 justify-center">
                            {control.helpExpression && (
                              <HelpIcon helpText={control.helpExpression} />
                            )}
                          </div>
                          <FormField flow="vertical" className="basis-9/12">
                            {control.type === "text" && (
                              <VSCodeTextField
                                className="vscode-input-rounded"
                                readOnly={control.readOnly}
                                {...register(control.id, {
                                  onChange: submitForm,
                                })}
                                onKeyUp={blurIfReturned}
                              />
                            )}
                            {control.type === "radio" && (
                              <FormField flow="vertical" className="basis-9/12">
                                <VSCodeRadioGroup
                                  readOnly={control.readOnly}
                                  {...register(control.id, {
                                    onChange: submitForm,
                                  })}
                                >
                                  {CMStatesArray.map((state, idx) => (
                                    <VSCodeRadio key={idx} value={state}>
                                      {state}
                                    </VSCodeRadio>
                                  ))}
                                </VSCodeRadioGroup>
                              </FormField>
                            )}
                            {control.type === "number" && (
                              <FormField flow="vertical" className="basis-9/12">
                                {/* FIXME: numberfield should render correct arrows */}
                                {/* @ts-ignore */}
                                <VSCodeNumberField
                                  className="vscode-input-rounded"
                                  readOnly={control.readOnly}
                                  step={1}
                                  pattern={/^\d*\.?\d{0,2}$/}
                                  {...register(control.id, {
                                    pattern: /^\d*\.?\d{0,2}$/,
                                    onChange: submitForm,
                                  })}
                                  onKeyUp={blurIfReturned}
                                />
                              </FormField>
                            )}
                          </FormField>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      )}
    </form>
  );
};

export default PropertySheet;
