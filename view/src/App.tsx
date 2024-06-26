// 3rd party libraries
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Providers
import { PropertiesDataProvider } from "./providers/PropertyDataProvider";
import { ViewpointPaths, useLayoutData } from "./providers/LayoutProvider";
import { CommandProvider } from "./contexts/CommandProvider";
import { WizardsProvider } from "./providers/WizardController";

// Pages that instantiate components
import HomeView from "./pages/HomeView";
import TableView from "./pages/TableView";
import TreeView from "./pages/TreeView";
import DiagramView from "./pages/DiagramView";
import PropertiesView from "./pages/PropertiesView";
import SetupTasksView from "./pages/SetupTasksView";
import TriplestoreStatusView from "./pages/TriplestoreStatusView";

// Interfaces
import { PropertyLayout, PropertyPage } from "./interfaces/PropertyLayoutsType";

// Components
import PropertySheet from "./components/Property/PropertySheet";
import wizards from "./components/Wizard/allWizards";

const queryClient = new QueryClient();

const App = () => {
  const { layouts } = useLayoutData();
  const root = document.getElementById("root");
  let route = [root?.getAttribute("data-initial-route") || "/"];

  const viewWithProviders = (view: React.JSX.Element) => (
    <CommandProvider>
      <WizardsProvider initialWizards={wizards}>
        <QueryClientProvider client={queryClient}>{view}</QueryClientProvider>
      </WizardsProvider>
    </CommandProvider>
  );

  // Generate routes from property layout data in src/vision/layouts/properties folder in OML model
  const propertyLayout = (layouts[
    ViewpointPaths.PropertyPanel
  ] as PropertyLayout) ?? { pages: [] };

  const propertyRoutes = propertyLayout.pages.map((page: PropertyPage) => (
    <Route
      key={page.id}
      path={page.id}
      element={<PropertySheet page={page} />}
    />
  ));

  // FIXME: Get the layout data from the OML model
  // // Generate routes from wizard layout data in src/vision/layouts/wizard folder in OML model
  // const wizardLayout = (layouts[
  //   ViewpointPaths.WizardPanel
  // ] as PropertyLayout) ?? { pages: [] };

  // const wizardRoutes = wizardLayout.pages.map((page: PropertyPage) => (
  //   <Route
  //     key={page.id}
  //     path={page.id}
  //     element={<PropertySheet page={page} />}
  //   />
  // ));

  return (
    <MemoryRouter initialEntries={route}>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route
          path="/triplestore-status-panel"
          element={<TriplestoreStatusView />}
        />
        <Route path="/setup-tasks-panel" element={<SetupTasksView />} />
        <Route path="/table-panel" element={viewWithProviders(<TableView />)} />
        <Route path="/tree-panel" element={viewWithProviders(<TreeView />)} />
        <Route
          path="/diagram-panel"
          element={viewWithProviders(<DiagramView />)}
        />
        <Route
          path="/property-panel/*"
          element={
            <PropertiesDataProvider>
              <PropertiesView layout={propertyLayout} />
            </PropertiesDataProvider>
          }
        >
          {propertyRoutes}
        </Route>
        {/* // FIXME: Get the layout data from the OML model */}
        {/* <Route
          path="/wizard-panel/*"
          element={
            <PropertiesDataProvider>
              <PropertiesView layout={wizardLayout} />
            </PropertiesDataProvider>
          }
        >
          {wizardRoutes}
        </Route> */}
      </Routes>
    </MemoryRouter>
  );
};

export default App;
