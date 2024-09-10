import * as vscode from "vscode";
import { CommandDefinitions, Commands } from "../../commands/src/commands";
import IWebviewType from "../../commands/src/interfaces/IWebviewType";
import { generatePropertySheet } from "./sparql/data-manager/generateDataUtils";
import { SparqlClient } from "./sparql/SparqlClient";
import ITableData from "../../view/src/interfaces/ITableData";
import { getIriTypes } from "./sparql/queries/GetIriTypes";
import { ViewpointPaths } from "../../commands/src/interfaces/ViewpointPaths";
import ITableCategory from "../../commands/src/interfaces/ITableCategory";

// Sidebar functions
import { TreeDataProvider } from "./sidebar/TreeDataProvider";
import { SetupTasksProvider } from "./sidebar/SetupTasksProvider";
import { TriplestoreStatusProvider } from "./sidebar/TriplestoreStatusProvider";

// Utilities functions
import { checkBuildFolder } from "./utilities/checkers/checkBuildFolder";
import { loadSparqlFiles } from "./utilities/loaders/loadSparqlFiles";
import { loadViewpointFiles } from "./utilities/loaders/loadViewpointFiles";
import { loadSparqlConfigFiles } from "./utilities/loaders/loadSparqlConfigFiles";

// Panel Classes
import { TablePanel } from "./panels/TablePanel";
import { PropertyPanelProvider } from "./panels/PropertyPanelProvider";
import { loadCommandFiles } from "./utilities/loaders/loadCommandFiles";

export let globalSparqlContents: { [filename: string]: string } = {};
export let globalViewpointContents: {
  [filename: string]: Record<string, string> | any[];
} = {};
export let globalCommandContents: {
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
        type: "home",
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.createWebview",
      (webviewType: IWebviewType) => {
        if (!webviewType) {
          vscode.window.showErrorMessage("Please specify a table type");
          return;
        }
        TablePanel.createOrShow(context.extensionPath, webviewType);
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
          .get(vsCodeContext.webviewPath)
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
          .get(vsCodeContext.webviewPath)
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

    // Find the full IWebviewType for the given webviewPath
    const webviewViewpoints = (globalViewpointContents[ViewpointPaths.Pages] ??
      []) as (IWebviewType | ITableCategory)[];
    const findViewpoint = (item: any): any =>
      item.path === diagram ? item : item.children?.find(findViewpoint);
    const diagramWebviewType = webviewViewpoints
      .reduce(
        (acc, viewpoint) => acc.concat(findViewpoint(viewpoint) || []),
        []
      )
      .find(Boolean);

    if (!diagramWebviewType)
      return vscode.window.showErrorMessage(
        "No diagram found for selected row(s)."
      );
    // @ts-ignore
    else if (diagramWebviewType.type !== "diagram")
      vscode.window.showErrorMessage(
        "Incorrect diagram configuration: webviewPath was not of type 'diagram'"
      );

    const diagramTable = TablePanel.currentPanels.get(diagram);

    if (diagramTable) {
      TablePanel.createOrShow(context.extensionPath, diagramWebviewType);
      diagramTable.sendMessage({
        command: Commands.CREATE_FILTERED_DIAGRAM,
        payload,
      });
    } else {
      TablePanel.createOrShow(
        context.extensionPath,
        diagramWebviewType,
        payload
      );
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
          .get(context.webviewPath)
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
      async (iri: string = "", webviewType: IWebviewType) => {
        // Open the property panel immediately when showProperties command is called
        provider.showPropertyPanel();

        let types: string[] = [];
        if (iri !== "") {
          const rawTypesQuery = getIriTypes(iri);
          const sparqlResult = await SparqlClient(rawTypesQuery, "query");
          types = sparqlResult.map((entry: ITableData) => entry.type);
        }

        const propertyData = {
          webviewType: webviewType,
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
      "oml-vision.sendViewpoints",
      (panel: TablePanel | PropertyPanelProvider) => {
        panel.sendMessage({
          command: Commands.SEND_VIEWPOINTS,
          payload: globalViewpointContents,
        });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "oml-vision.sendCommands",
      (panel: TablePanel | PropertyPanelProvider) => {
        panel.sendMessage({
          command: Commands.SEND_COMMANDS,
          payload: globalCommandContents,
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
          TablePanel.currentPanels.get(context.webviewPath)?.sendMessage({
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

  // default the 'hasBuildFolder' and 'hasPageViewpoint' and 'hasSparqlConfig' properties to false in the Sidebar
  /**
   * Register Tree Data to show data in the sidebar
   *
   * @remarks
   * This method uses the {@link https://code.visualstudio.com/api/extension-guides/tree-view| Tree View API}
   */
  const treeDataProvider = TreeDataProvider.getInstance();
  vscode.window.registerTreeDataProvider(
    "vision-webview-pages",
    treeDataProvider
  );

  /*** START set up Vision repo context ***/
  vscode.commands.executeCommand("setContext", "vision:hasBuildFolder", false);
  let buildFolderWatcher = vscode.workspace.createFileSystemWatcher("**/build");
  let sparqlFolderWatcher = vscode.workspace.createFileSystemWatcher(
    "**/src/vision/sparql/*.sparql"
  );
  let viewpointsFolderWatcher = vscode.workspace.createFileSystemWatcher(
    "**/src/vision/viewpoints/**/*.json"
  );
  let commandsFolderWatcher = vscode.workspace.createFileSystemWatcher(
    "**/src/vision/commands/*.json"
  );
  let sparqlConfigFolderWatcher = vscode.workspace.createFileSystemWatcher(
    "**/src/vision/config/*.json"
  );

  // Watch for creation of 'build' folder
  buildFolderWatcher.onDidCreate(() => {
    vscode.commands.executeCommand("setContext", "vision:hasBuildFolder", true);
    treeDataProvider.updateHasBuildFolder(true);
  });

  // Watch for deletion of 'build' folder
  buildFolderWatcher.onDidDelete(() => {
    vscode.commands.executeCommand(
      "setContext",
      "vision:hasBuildFolder",
      false
    );
    treeDataProvider.updateHasBuildFolder(false);
  });
  context.subscriptions.push(buildFolderWatcher);

  // Check if 'build' folder exists on start
  checkBuildFolder(treeDataProvider);

  // Load all files initially
  loadSparqlFiles(globalSparqlContents).catch((err) => {
    console.error("Error loading SPARQL files from model:", err);
  });

  loadViewpointFiles(globalViewpointContents).catch((err) => {
    console.error("Error loading viewpoint files from model:", err);
  });

  loadCommandFiles(globalCommandContents).catch((err) => {
    console.error("Error loading command files from model:", err);
  });

  loadSparqlConfigFiles().catch((err) => {
    console.error("Error loading SPARQL config from model:", err);
  });

  // Watch for changes in SPARQL files
  sparqlFolderWatcher.onDidChange(() => {
    globalSparqlContents = {};
    loadSparqlFiles(globalSparqlContents);
  });
  sparqlFolderWatcher.onDidCreate(() => {
    globalSparqlContents = {};
    loadSparqlFiles(globalSparqlContents);
  });
  sparqlFolderWatcher.onDidDelete(() => {
    globalSparqlContents = {};
    loadSparqlFiles(globalSparqlContents);
  });

  // Watch for changes in JSON viewpoint files
  viewpointsFolderWatcher.onDidChange(() => {
    globalViewpointContents = {};
    loadViewpointFiles(globalViewpointContents);
  });
  viewpointsFolderWatcher.onDidCreate(() => {
    globalViewpointContents = {};
    loadViewpointFiles(globalViewpointContents);
  });
  viewpointsFolderWatcher.onDidDelete(() => {
    globalViewpointContents = {};
    loadViewpointFiles(globalViewpointContents);
  });

  // Watch for changes in JSON command files
  commandsFolderWatcher.onDidChange(() => {
    globalCommandContents = {};
    loadCommandFiles(globalCommandContents);
  });
  commandsFolderWatcher.onDidCreate(() => {
    globalCommandContents = {};
    loadCommandFiles(globalCommandContents);
  });
  commandsFolderWatcher.onDidDelete(() => {
    globalCommandContents = {};
    loadCommandFiles(globalCommandContents);
  });

  // Watch for changes in SPARQL Config JSON files
  sparqlConfigFolderWatcher.onDidChange(() => loadSparqlConfigFiles());
  sparqlConfigFolderWatcher.onDidCreate(() => loadSparqlConfigFiles());
  sparqlConfigFolderWatcher.onDidDelete(() => loadSparqlConfigFiles());

  context.subscriptions.push(sparqlFolderWatcher);
  context.subscriptions.push(viewpointsFolderWatcher);
  context.subscriptions.push(commandsFolderWatcher);
  context.subscriptions.push(sparqlConfigFolderWatcher);
  /*** END Vision context creation ***/

  /* START Sidebar Providers CODE */
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
    const triplestoreStatusProvider = new TriplestoreStatusProvider(
      context.extensionPath,
      gradleApi
    );
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        TriplestoreStatusProvider.viewType,
        triplestoreStatusProvider
      )
    );
    // TODO: Assumes fuseki for now.  Change to accomodate other triplestores
    let triplestoreLogFileWatcher = vscode.workspace.createFileSystemWatcher(
      "**/.fuseki/fuseki.log"
    );

    // Watch for changes in triplestore log file
    triplestoreLogFileWatcher.onDidChange(() => {
      triplestoreStatusProvider.pingTriplestoreTask();
    });
    triplestoreLogFileWatcher.onDidCreate(() => {
      triplestoreStatusProvider.pingTriplestoreTask();
    });
    triplestoreLogFileWatcher.onDidDelete(() => {
      triplestoreStatusProvider.pingTriplestoreTask();
    });

    // Define a function to execute the Ping task
    const runPingTask = async () => {
      try {
        await triplestoreStatusProvider.pingTriplestoreTask();
      } catch (err) {
        console.error(`Error: ${err}`);
      }
    };

    // Run the Ping task every second
    setInterval(runPingTask, 1000);
  });

  /* END Sidebar Providers CODE */
}

// TODO: Implement cloneSelectedRows in commands
function cloneSelectedRows(context: Record<string, any>) {
  throw new Error("Function not implemented.");
}
