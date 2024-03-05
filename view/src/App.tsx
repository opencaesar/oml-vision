import React from "react";
import { MemoryRouter, Navigate, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropertiesDataProvider } from "./contexts/PropertyDataProvider";
import { LayoutPaths, useLayoutData } from "./contexts/LayoutProvider";
import HomeView from "./pages/HomeView";
import TableView from "./pages/TableView";
import TreeView from "./pages/TreeView";
import DiagramView from "./pages/DiagramView";
import PropertiesView from "./pages/PropertiesView";
import { PropertyLayout, PropertyPage } from "./interfaces/PropertyLayoutsType";
import PropertySheet from "./components/PropertySheet";
import wizards from "./components/WizardController/allWizards";
import { WizardsProvider } from "./contexts/WizardController";
import SetupTasksView from "./pages/SetupTasksView";
import LoadedTriplestoreView from "./pages/LoadedTriplestoreView";

const queryClient = new QueryClient();

const App = () => {
  const { layouts } = useLayoutData();
  const root = document.getElementById("root");
  let route = [root?.getAttribute("data-initial-route") || "/"];

  const viewWithProviders = (view: React.JSX.Element) => (
    <WizardsProvider initialWizards={wizards}>
      <QueryClientProvider client={queryClient}>{view}</QueryClientProvider>
    </WizardsProvider>
  );

  // Generate routes from property layout data
  const propertyLayout = (layouts[
    LayoutPaths.PropertyPanel
  ] as PropertyLayout) ?? { pages: [] };
  const propertyRoutes = propertyLayout.pages.map((page: PropertyPage) => (
    <Route
      key={page.id}
      path={page.id}
      element={<PropertySheet page={page} />}
    />
  ));

  return (
    <MemoryRouter initialEntries={route}>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/loaded-triplestore-panel" element={<LoadedTriplestoreView />} />
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
      </Routes>
    </MemoryRouter>
  );
};

export default App;
