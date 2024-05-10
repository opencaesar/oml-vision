# Change Log

All notable changes to the "oml-vision" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

Look at the OML Vision Docs [Changelog](http://www.opencaesar.io/oml-vision-docs/changelog)

## v0.3.0 - Venus

### Added
- Property View: execute commands from property sheet https://github.com/opencaesar/oml-vision/pull/58
- Table, Tree, and Diagram Views: execute commands from a context/right click menu file https://github.com/opencaesar/oml-vision/pull/54
- Wizard View: Add deletion wizards and the ability to delete OML instances and relations https://github.com/opencaesar/oml-vision/pull/70
- Table View: hide/show columns https://github.com/opencaesar/oml-vision/pull/63
- Table View: change font size https://github.com/opencaesar/oml-vision/pull/65
- Table View: reset column size https://github.com/opencaesar/oml-vision/pull/67
- Diagram View: show OML relations for selected node in wizard https://github.com/opencaesar/oml-vision/pull/73

### Fixed
- Property View: not opening immediately when clicking a row or node in the TableView, TreeView, or DiagramView https://github.com/opencaesar/oml-vision/issues/61


## v0.2.6 - Rembrandt Basin

### Added
- Property View: Allows users to see the properties of elements selected in the webview https://github.com/opencaesar/oml-vision/pull/42
- Property View: Allow users to specify a `number` type for controls in the property sheet https://github.com/opencaesar/oml-vision/pull/44

### Modified
- Viewpoints: Listen to viewpoints directory instead of layouts directory (Change layouts directory to viewpoints directory) https://github.com/opencaesar/oml-vision/issues/40

## v0.2.5 - Caloris Basin

### Fixed
- Table, Tree, and Diagram Views: cannot generate a view when there are more than 2 sets of layouts objects that contain the "children" attribute in the pages.json file https://github.com/opencaesar/oml-vision/pull/37

### Added
- Table, Tree, and Diagram Views: refactor layouts to support viewpoint definitions for each page https://github.com/opencaesar/oml-vision/pull/33
- Sidebar: add UI indication that data has been loaded into Fuseki RDF Triplestore https://github.com/opencaesar/oml-vision/pull/34
- Tree View: add ability to specify and edits columns https://github.com/opencaesar/oml-vision/pull/36

## v0.2.0 - Mercury

### Fixed
- Tree View: shows VSCode error popup with Tree UI bugs https://github.com/opencaesar/oml-vision/pull/5

### Added
- Diagram View: Add export to SVG for diagrams https://github.com/opencaesar/oml-vision/pull/3
- Developer Experience: Add VSCode dev container https://github.com/opencaesar/oml-vision/pull/21
- Diagram View: Add ability to change node and node text color while automatically changing node color based on node type https://github.com/opencaesar/oml-vision/pull/22
- Diagram View: Add ability to animate edges https://github.com/opencaesar/oml-vision/pull/23
- Diagram View: Add ability to highlight/unlight connected edges to selected nodes https://github.com/opencaesar/oml-vision/pull/24
- Diagram View: Add ability to automatically apply a position layout to nodes and edges https://github.com/opencaesar/oml-vision/pull/25
- Diagram View: Add ability to apply a layout algorithm to nodes and edges https://github.com/opencaesar/oml-vision/pull/27

## 0.1.0

### Added
- Initial release