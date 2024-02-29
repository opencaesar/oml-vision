import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { IconSettings, IconDatabase, IconBranch, IconFilter, IconChecklist, IconLink } from '@nasa-jpl/react-stellar';
import { parse, EvalAstFactory } from 'jexpr';
import NavTab from '../components/shared/NavTab';
import { usePropertiesData } from '../contexts/PropertyDataProvider';
import { PropertyLayout, PropertyPage } from '../interfaces/PropertyLayoutsType';
import { IDisplayGroup } from '../interfaces/IDisplayGroup';

const astFactory = new EvalAstFactory();

// Icon map for dynamic rendering from layout json
const ICONS = {
  IconSettings,
  IconDatabase,
  IconBranch,
  IconFilter,
  IconChecklist,
  IconLink,
  // Add any additional icons you are using here
}

const PropertiesView: React.FC<{layout: PropertyLayout}> = ({
  layout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { webviewType: { path }, rowIri, tableRowTypes, isAvailable } = usePropertiesData();
  const [displayPages, setDisplayPages] = useState<IDisplayGroup[]>([]);

  const PropertyLayouts: PropertyPage[] = layout.pages;
  const propertyPages = isAvailable && PropertyLayouts ? PropertyLayouts : null;

  // When tableRowTypes changes, we re-evaluate the displayExpressions
  // to determine which pages to display for the current row.
  useEffect(() => {
    if (isAvailable) {
      // Generate displayPages based on current tableRowTypes
      const evaluatedExpressions = PropertyLayouts
      .filter(page => page.preconditionExpression).map((expression) => {
        let display: boolean;
        try {
          const expr = parse(expression.preconditionExpression, astFactory);
          if (!expr) throw new Error(`Invalid expression: ${expression.preconditionExpression}`);
          display = expr.evaluate({ path });
        } catch (error) {
          console.error(`Failed to evaluate display expression for group ${expression.id}: ${error}`);
          display = false;
        }

        // Return an object that matches the DisplayGroup interface
        return {
          id: expression.id,
          display
        };
      });
      setDisplayPages(evaluatedExpressions);

      // Set the default page to the FIRST displayed page
      const firstDisplayPage = propertyPages?.find(page => {
        const pageInDisplayPages = evaluatedExpressions.find(x => x.id === page.id);
        return pageInDisplayPages ? pageInDisplayPages.display : !page.preconditionExpression;
      });
      if (firstDisplayPage) {
        navigate(`/property-panel/${firstDisplayPage.id}`);
      }
    }
  }, [isAvailable, tableRowTypes])

  return (
    <div className="properties-container">
      {!propertyPages ? (
        <span className="font-medium ml-[20px]">There are no OML Vision properties to be displayed.</span>
      ) : (
        <div className="h-screen flex">
          <div id="side-bar" className="h-screen flex-grow-0 flex-shrink-0 w-60 text-[color:var(--vscode-foreground)] overflow-y-auto">
            <ul>
              {propertyPages.map((page, index) => {
                // Checks if this page is in displayPages. If it is, we use the display prop (true/false)
                // If not, we default to true because only groups with displayExpressions are optionally displayed
                const pageInDisplayPages = displayPages.find(x => x.id == page.id);
                const isConditionalGroup = page.preconditionExpression;
                // If pageInDisplayPages not found, ONLY display page if it is not a conditional page
                const shouldDisplay = pageInDisplayPages ? pageInDisplayPages.display : !isConditionalGroup;

                const IconComponent = page.icon in ICONS ? ICONS[page.icon as keyof typeof ICONS] : null;
                if (shouldDisplay) return (
                  <li key={page.id}>
                    <NavTab to={`/property-panel/${page.id}`}>
                      {IconComponent && <IconComponent className="pr-[8px] flex-shrink-0 flex-grow-0 text-[color:var(--vscode-foreground)]" width="20" height="20" />}
                      {page.label}
                    </NavTab>
                  </li>
                )
              })}
            </ul>
          </div>
          <div id="content" className="h-screen flex-grow bg-[color:var(--vscode-editor-background)] overflow-y-auto">
            <Outlet />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesView;