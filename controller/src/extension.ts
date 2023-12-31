import * as vscode from "vscode";
import { CommandDefinitions, Commands } from "../../commands/src/commands";
import ITableType from "../../commands/src/interfaces/ITableType";
import { SidebarProvider } from "./Sidebar";
import { SetupTasksProvider } from "./SetupTasksProvider";
import { generatePropertySheet } from "./sparql/data-manager/generateDataUtils";
import { SparqlClient } from "./sparql/SparqlClient";
import ITableData from "../../view/src/interfaces/ITableData";
import { getIriTypes } from "./sparql/queries/GetIriTypes";
import { LayoutPaths } from "../../commands/src/interfaces/LayoutPaths";
import ITableCategory from "../../commands/src/interfaces/ITableCategory";

// Utilities functions
import { checkBuildFolder } from "./utilities/checkers/checkBuildFolder";
import { loadSparqlFiles } from "./utilities/loaders/loadSparqlFiles";
import { loadLayoutFiles } from "./utilities/loaders/loadLayoutFiles";
import { loadSparqlConfigFiles } from "./utilities/loaders/loadSparqlConfigFiles";

// Panel Classes
import { TablePanel } from "./panels/TablePanel";
import { PropertyPanelProvider } from "./panels/PropertyPanelProvider";

export let globalSparqlContents: { [filename: string]: string } = {};
export let globalLayoutContents: {
  [filename: string]: Record<string, string> | any[];
} = {};

export function activate(context: vscode.ExtensionContext) {
  const provider = PropertyPanelProvider.getInstance(context.extensionPath);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PropertyPanelProvider.viewType,
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("oml-vision.home", () => {
      TablePanel.createOrShow(context.extensionPath, {
        title: "OML Vision Home",
        path: "/",
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.createTable",
      (tableType: ITableType) => {
        if (!tableType) {
          vscode.window.showErrorMessage("Please specify a table type");
          return;
        }
        TablePanel.createOrShow(context.extensionPath, tableType);
      }
    )
  );

  /* START Register TablePanel context-menu commands */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "refactor-row.change-lifecycle-state",
      async (vsCodeContext: Record<string, any>) => {
        let currentState = null;
        // Only get current state if there's one row selected
        if (vsCodeContext.iri.length == 1) {
          // TODO: DON'T hard code sparql file!!!
          let sparqlResult: Record<string, any>[] = [];
          try {
            sparqlResult = await SparqlClient(
              "assembly-state.sparql",
              "query",
              vsCodeContext.iri
            );
          } catch (err) {
            sparqlResult = [];
            console.error("Error occurred while fetching sparqlResult:", err);
          }
          currentState = sparqlResult[0]?.fse_lifecycleState ?? null;
        }

        const payload = {
          key: "LifecycleStateWizard",
          props: {
            iriArray: vsCodeContext.iri,
            currentState: currentState,
          },
        };

        TablePanel.currentPanels
          .get(vsCodeContext.tablePath)
          ?.sendMessage({ command: Commands.OPEN_WIZARD, payload });
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.create-fault-containment-region",
      async (vsCodeContext: Record<string, any>) => {
        const payload = {
          key: "CreateFaultContainmentRegionWizard",
          props: {
            iriArray: vsCodeContext.iri,
          },
        };

        TablePanel.currentPanels
          .get(vsCodeContext.tablePath)
          ?.sendMessage({ command: Commands.OPEN_WIZARD, payload });
      }
    )
  );
  const createDiagram = (
    vsCodeContext: Record<string, any>,
    diagram: string
  ) => {
    const payload = {
      rowType: vsCodeContext.rowType,
      rowTypesObject: vsCodeContext.rowTypesObject,
      iriArray: vsCodeContext.iri,
    };

    // Find the full ITableType for the given tablePath
    const tableLayouts = (globalLayoutContents[LayoutPaths.Pages] ?? []) as (
      | ITableType
      | ITableCategory
    )[];
    const findTable = (item: any): any =>
      item.path === diagram ? item : item.children?.find(findTable);
    const diagramTableType = tableLayouts
      .reduce((acc, table) => acc.concat(findTable(table) || []), [])
      .find(Boolean);

    if (!diagramTableType)
      return vscode.window.showErrorMessage(
        "No diagram found for selected row(s)."
      );
    // @ts-ignore
    else if (!diagramTableType.isDiagram)
      vscode.window.showErrorMessage(
        "Incorrect diagram configuration: tablePath was not of type 'diagram'"
      );

    const diagramTable = TablePanel.currentPanels.get(diagram);

    if (diagramTable) {
      TablePanel.createOrShow(context.extensionPath, diagramTableType);
      diagramTable.sendMessage({
        command: Commands.CREATE_FILTERED_DIAGRAM,
        payload,
      });
    } else {
      TablePanel.createOrShow(context.extensionPath, diagramTableType, payload);
    }
  };

  // TODO: don't hard code the paths somehow D: unfortunately this is difficult because VS Code context menus can't be dynamically created.
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.create-ref-des-diagram",
      async (vsCodeContext: Record<string, any>) => {
        createDiagram(vsCodeContext, "reference-designators-diagram");
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.create-assembly-diagram",
      async (vsCodeContext: Record<string, any>) => {
        createDiagram(vsCodeContext, "assembly-diagram");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.delete-row",
      async (context: Record<string, any>) => {
        const payload = {
          key: "DeleteElementsWizard",
          props: {
            iriArray: context.iri,
            labelArray: context.labelArray,
          },
        };

        TablePanel.currentPanels
          .get(context.tablePath)
          ?.sendMessage({ command: Commands.OPEN_WIZARD, payload });
      }
    )
  );
  /* END Register TablePanel context-menu commands */

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.generatePropertySheet",
      (
        payload: CommandDefinitions[Commands.GENERATE_PROPERTY_SHEET]["payload"]
      ) => {
        // Every property sheet must be generated based on a query & IRI
        if (!payload.queryName || !payload.iri) {
          provider.sendMessage({
            command: Commands.LOADED_PROPERTY_SHEET,
            payload: [],
            errorMessage: "Error: Property query requires queryName and IRI.",
          });
          return;
        }

        generatePropertySheet(provider, payload.queryName, payload.iri);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.showProperties",
      async (iri: string = "", tableType: ITableType) => {
        let types: string[] = [];
        if (iri !== "") {
          const rawTypesQuery = getIriTypes(iri);
          const sparqlResult = await SparqlClient(rawTypesQuery, "query");
          types = sparqlResult.map((entry: ITableData) => entry.type.value);
        }

        const propertyData = {
          tableType: tableType,
          rowIri: iri,
          tableRowTypes: types,
        };
        provider.setPendingPayload(propertyData);

        // Try to set the properties before focusing.
        // If successful, the pendingPayload that was just set
        // above will be cleared via the receivedProperties acknowledgement
        // in the panel provider. Race condition handling :(
        provider.sendMessage({
          command: Commands.SHOW_PROPERTIES,
          payload: propertyData,
        });
        provider.showPropertyPanel();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("oml-vision.sendPropertiesToPanel", () => {
      const pendingPayload = provider.getPendingPayload();
      if (pendingPayload) {
        provider.sendMessage({
          command: Commands.SHOW_PROPERTIES,
          payload: pendingPayload,
        });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("oml-vision.hideProperties", () => {
      provider.sendMessage({ command: Commands.HIDE_PROPERTIES });

      // if a payload was about to be sent to the panel, clear it
      // because user just pressed on another row that doesn't show properties
      provider.setPendingPayload(null);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.sendLayouts",
      (panel: TablePanel | PropertyPanelProvider) => {
        panel.sendMessage({
          command: Commands.SEND_LAYOUTS,
          payload: globalLayoutContents,
        });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("oml-vision.clone-row", cloneSelectedRows)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.create-row",
      async (context: Record<string, any>) => {
        if (context.iri.length === 1) {
          TablePanel.currentPanels.get(context.tablePath)?.sendMessage({
            command: Commands.OPEN_WIZARD,
            payload: {
              key: "CreateElementWizard",
              props: { iriArray: context.iri },
            },
          });
        } else if (context.iri.length > 1) {
          vscode.window.showErrorMessage(
            "Only select one Subsystem to create the new assembly under."
          );
        }
      }
    )
  );

  // default the 'hasBuildFolder' and 'hasPageLayout' and 'hasSparqlConfig' properties to false in the Sidebar
  const sidebarProvider = SidebarProvider.getInstance();
  vscode.window.registerTreeDataProvider("vision-pages", sidebarProvider);

  /*** START set up Vision repo context ***/
  vscode.commands.executeCommand("setContext", "vision:hasBuildFolder", false);
  let buildFolderWatcher = vscode.workspace.createFileSystemWatcher("**/build");
  let sparqlFolderWatcher = vscode.workspace.createFileSystemWatcher(
    "**/src/vision/sparql/*.sparql"
  );
  let layoutsFolderWatcher = vscode.workspace.createFileSystemWatcher(
    "**/src/vision/layouts/*.json"
  );
  let sparqlConfigFolderWatcher = vscode.workspace.createFileSystemWatcher(
    "**/src/vision/config/*.json"
  );

  // Watch for creation of 'build' folder
  buildFolderWatcher.onDidCreate(() => {
    vscode.commands.executeCommand("setContext", "vision:hasBuildFolder", true);
    sidebarProvider.updateHasBuildFolder(true);
  });

  // Watch for deletion of 'build' folder
  buildFolderWatcher.onDidDelete(() => {
    vscode.commands.executeCommand(
      "setContext",
      "vision:hasBuildFolder",
      false
    );
    sidebarProvider.updateHasBuildFolder(false);
  });
  context.subscriptions.push(buildFolderWatcher);

  // Check if 'build' folder exists on start
  checkBuildFolder(sidebarProvider);

  // Load all files initially
  loadSparqlFiles(globalSparqlContents).catch((err) => {
    console.error("Error loading SPARQL files from model:", err);
  });

  loadLayoutFiles(globalLayoutContents).catch((err) => {
    console.error("Error loading layout files from model:", err);
  });

  loadSparqlConfigFiles().catch((err) => {
    console.error("Error loading SPARQL config from model:", err);
  });

  // Watch for changes in SPARQL files
  sparqlFolderWatcher.onDidChange(() => loadSparqlFiles(globalSparqlContents));
  sparqlFolderWatcher.onDidCreate(() => loadSparqlFiles(globalSparqlContents));
  sparqlFolderWatcher.onDidDelete(() => loadSparqlFiles(globalSparqlContents));

  // Watch for changes in JSON layout files
  layoutsFolderWatcher.onDidChange(() => loadLayoutFiles(globalLayoutContents));
  layoutsFolderWatcher.onDidCreate(() => loadLayoutFiles(globalLayoutContents));
  layoutsFolderWatcher.onDidDelete(() => loadLayoutFiles(globalLayoutContents));

  // Watch for changes in SPARQL Config JSON files
  sparqlConfigFolderWatcher.onDidChange(() => loadSparqlConfigFiles());
  sparqlConfigFolderWatcher.onDidCreate(() => loadSparqlConfigFiles());
  sparqlConfigFolderWatcher.onDidDelete(() => loadSparqlConfigFiles());

  context.subscriptions.push(sparqlFolderWatcher);
  context.subscriptions.push(layoutsFolderWatcher);
  context.subscriptions.push(sparqlConfigFolderWatcher);
  /*** END Vision context creation ***/

  /* START Setup Tasks Provider CODE */
  const gradleForJavaExtension = vscode.extensions.getExtension(
    "vscjava.vscode-gradle"
  );
  if (!gradleForJavaExtension) {
    throw new Error("Gradle for Java extension is not installed");
  }

  gradleForJavaExtension.activate().then((gradleApi) => {
    const setupTasksProvider = new SetupTasksProvider(
      context.extensionPath,
      gradleApi
    );
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        SetupTasksProvider.viewType,
        setupTasksProvider
      )
    );
  });
  /* END Setup Tasks Provider CODE */
}

// TODO: Implement cloneSelectedRows in commands
function cloneSelectedRows(context: Record<string, any>) {
  throw new Error("Function not implemented.");
}
