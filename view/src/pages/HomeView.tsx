import React, { useEffect, useState, KeyboardEvent } from "react";
import "@nasa-jpl/react-stellar/dist/esm/stellar.css";
import ExpandingMenu from "../components/ExpandingMenu";
import { postMessage } from "../utils/postMessage";
import { Commands } from "../../../commands/src/commands";
import { IconVisibleShow, IconSearch } from "@nasa-jpl/react-stellar";
import Loader from "../components/shared/Loader";
import { SubmenuData } from "../interfaces/SubmenuData";
import { LayoutPaths, useLayoutData } from "../contexts/LayoutProvider";
import packageJson from "../../../package.json"

const MAX_SEARCH_SUGGESTIONS = 4;
const SETTINGS = packageJson

const HomeView: React.FC<{}> = () => {
  const { layouts, isLoadingLayoutContext } = useLayoutData();
  const [ submenuData, setSubmenuData ] = useState<SubmenuData[]>([]);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [ selectedResult, selectResult ] = useState(0);
  const [ title, setTitle ] = useState<string>('');
  const [ version, setVersion ] = useState<string>('');

  useEffect(() => {
    if (isLoadingLayoutContext) return;

    const tableLayouts = layouts[LayoutPaths.Pages] ?? [];
    setSubmenuData(tableLayouts.filter((item: any) => ('title' in item && 'children' in item && 'iconUrl' in item)));
    setIsLoading(false);
  }, [layouts, isLoadingLayoutContext]);

  // Set the Title and Version to the displayName and version in the package.json file
  useEffect(() => {
    setTitle(SETTINGS.displayName)
    setVersion(SETTINGS.version)
  }, [])

  if (isLoading || isLoadingLayoutContext) {
    return (
      <div className="table-container h-screen flex justify-center">
        <Loader message={"Loading tree data..."} />
      </div>
    )
  }

  // creates a flat array from all submenus loaded
  const searchList: any[] = submenuData.map(submenuData => {
    return submenuData.children.map(child => {
      child.parent = submenuData;
      return child;
    });
  }).flat();

  return (
    <div>

      {/* Header */}
      <div className="relative h-9 w-full p-1 pl-4 bg-[color:var(--vscode-banner-background)] border-b border-[color:var(--vscode-editor-foreground)]">

        {/* Search stuff */}
        <div className="w-fit h-fit">
          {/* Search bar */}
          <div id="search-bg" className="flex items-center w-80 h-full rounded-full overflow-hidden bg-[color:var(--vscode-welcomePage-tileHoverBackground)] border-2 border-[color:var(--vscode-editor-foreground)] transition">
            <IconSearch className="w-6 h-6 p-1"/>
            <input
              type="text"
              placeholder="Search..." 
              id="searchbar" 
              onKeyUp={filterSuggestions} 
              onKeyDown={selectDropdownItem} 
              onFocus={searchFocusChanged} 
              onBlur={searchFocusChanged} 
              className="bg-transparent flex-grow text-sm placeholder:italic placeholder:text-[color:var(--vscode-editorActiveLineNumber-foreground)] text-[color:var(--vscode-settings-textInputForeground)]" 
              style={{ outline: "none" }}
            />
          </div>
          {/* Suggestions dropdown */}
          <div id="search-dropdown" className="relative -translate-x-1/2 left-1/2 w-64 h-fit rounded-b-xl border border-t-0 border-[color:var(--vscode-menu-border)] z-10 overflow-hidden hidden bg-[color:var(--vscode-editor-background)]">
            {searchList.map(searchItem => createSearchResultBtn(searchItem.title, searchItem.parent.title, searchItem.path, searchItem.type))}
          </div>
        </div>

        {/* top-right text */}
        <h1 className="absolute top-0 right-2.5 text-lg text-[color:var(--vscode-settings-textInputForeground)]">{title}</h1><br/>
        <h3 className="absolute bottom-0 right-2.5 text-xs text-[color:var(--vscode-settings-textInputForeground)]"><IconVisibleShow className="inline" /> v{version}</h3>
      </div>

      {/* Links for each view */}
      <div className="table clear-both w-full h-full p-4 overflow-auto">
        {submenuData.map(submenu => (
          <ExpandingMenu title={submenu.title} icon={{url: submenu.iconUrl}} buttons={submenu.children.map(child => {
            return { text: child.title, redirect: { title: child.title, path: child.path ? child.path : child.title, type: child.type } };
          })} />
        ))}
      </div>

    </div>
  );

  // used when up/down arrow keys are pressed
  function selectDropdownItem(event: KeyboardEvent) {
    let delta = 0;
    switch(event.key) {
      case 'ArrowUp': // up
        selectResult(selectedResult === (MAX_SEARCH_SUGGESTIONS-1) ? 0 : selectedResult+1);
        delta = selectedResult === (MAX_SEARCH_SUGGESTIONS-1) ? -(MAX_SEARCH_SUGGESTIONS-1) : 1;
        break;
      case 'ArrowDown': // down
        selectResult(selectedResult === 0 ? (MAX_SEARCH_SUGGESTIONS-1) : selectedResult-1);
        delta = selectedResult === 0 ? (MAX_SEARCH_SUGGESTIONS-1) : -1;
        break;
      case 'Enter':
        selectResult(0);
        break;
      default:
        return;
    }
    event.preventDefault(); // stops the page from scrolling

    // makes sure dropdown is visible
    const dropdown = document.getElementById('search-dropdown');
    dropdown?.classList.remove('hidden');

    // selects the specific item in the dropdown and focuses it
    let count = 0;
    [].slice.call(dropdown?.children).reverse().map((child: HTMLElement) => {
      if (child && !child.classList.contains('hidden')) {
        if (count === selectedResult + delta) {
          if (event.key === 'Enter') {
            child.click();
          } else {
            child.focus();
          }
        }
        count++;
      }
    });
  }

  // used to display the closest 'X' pages in the dropdown menu, 'X' defined by MAX_SEARCH_SUGGESTIONS
  // this is usually called whenever the search bar content changes
  function filterSuggestions() {
    const input = document.getElementById('searchbar') as HTMLInputElement;
    const query = input.value.toUpperCase();
    const dropdown = document.getElementById('search-dropdown');
    selectResult(0);

    // hide dropdown if query is empty, and end here
    if (query.length === 0) {
      dropdown?.classList.add("hidden");
      return;
    }
    dropdown?.classList.remove("hidden");

    // sorts all suggestions by order of which page contains the query earliest in its title
    const suggestions: Element[] = (dropdown?.children ? Array.from(dropdown.children) : []).sort(
      (a: Element, b: Element) => {
        const contentA = (a.textContent as string).toUpperCase();
        const contentB = (b.textContent as string).toUpperCase();
        return contentA.indexOf(query) - contentB.indexOf(query);
      }
    );

    // hides all pages which don't contain the query
    // OR if the page is not one of the top 'X' suggestions, 'X' defined by MAX_SEARCH_SUGGESTIONS
    let count = 0;
    suggestions.forEach((element: Element) => {
      if (count >= MAX_SEARCH_SUGGESTIONS) {
        element.classList.add("hidden");
      } else if (element.textContent && element.textContent.toUpperCase().indexOf(query) >= 0) {
        element.classList.remove("hidden");
        count++;
        dropdown?.appendChild(element);
      } else {
        element.classList.add("hidden");
      }
    });
  }

  // creates the buttons seen within the search dropdown
  function createSearchResultBtn(header: string, subtext: string, path: string, type: string): React.ReactElement {
    return (
      <button onKeyDown={selectDropdownItem} style={{ outline: "none" }} className="w-full h-fit p-0.5 px-1.5 border-0 hidden bg-transparent hover:bg-[color:var(--vscode-welcomePage-tileHoverBackground)] focus:bg-[color:var(--vscode-welcomePage-tileHoverBackground)] transition" onClick={() => {
        postMessage({
          command: Commands.CREATE_TABLE,
          payload: {
            title: header,
            path: path,
            type: type
          }
        });
      }} onBlur={searchFocusChanged}>
        <h3 className="text-base text-left text-[color:var(--vscode-settings-textInputForeground)]">{header}</h3>
        <p className="text-xs text-left text-[color:var(--vscode-settings-textInputForeground)]">{subtext}</p>
      </button>
    );
  }

  function searchFocusChanged(event: React.FocusEvent) {
    const searchbar = document.getElementById('searchbar') as HTMLInputElement;
    const outline = document.getElementById('search-bg');
    const dropdown = document.getElementById('search-dropdown');
    if (!searchbar || !outline || !dropdown) {
      return;
    } else if (document.activeElement === searchbar || dropdown.contains(event.relatedTarget)) {
      outline.style.borderColor = 'var(--vscode-editorCommentsWidget-unresolvedBorder)';
      if (searchbar.value.length > 0) {
        dropdown.classList.remove('hidden');
      }
    } else {
      outline.style.borderColor = 'var(--vscode-editor-foreground)';
      dropdown.classList.add('hidden');
    }
  }
};

export default HomeView;
