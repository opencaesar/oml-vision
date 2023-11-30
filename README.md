<img src="https://github.com/opencaesar/opencaesar.github.io/blob/37e3cbe385910749e0c430637b7032f420a49f35/assets/img/vision480x96.png?raw=true">

## Namesake Origin
https://www.futureengineers.org/nametherover/gallery/23269

## User Documentation
TBD - In Progress

## Development Guide
Link to [DEVELOPMENT.md](DEVELOPMENT.md)

## Code of Conduct
Link to [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Contributing Guide
Link to [CONTRIBUTING.md](CONTRIBUTING.md)

## Change Log
Link to [CHANGELOG.md](CHANGELOG.md)

### OML Vision - VSCode based workbench to edit OML models

OML Vision - VSCode based workbench to edit OML models

OML Vision is a plugin to Microsoft's Visual Studio Code environment that provides a framework for constructing forms, tables, and graphical views for editing or visualizing semantic models.

As a plugin to VSCode, OML Vision applications can take advantage of other plugins to provide access to model assets
such as databases or git repositories. Since VSCode can be run as a desktop application or as a web hosted web
application, so can OML Vision.

An OML Vision adaptation specializes queries that can retrieve semantic model data from a data source, transforming
the data into JSON form. And then it connects queries with various rendering models that map the structure of the data
onto tables, forms, or other visual elements the user can manipulate.
OML Vision is designed for use with semantic models specified in the web ontology language (OWL) or its specialized
subset, the Ontological Modeling Language (OML) but can be adapted to use with any structured data that can be queried
from a database.

OML Vision is a framework rather than a standalone application. It must be specialized to a particular semantic web
vocabulary (OML or OWL) and that vocabulary must be mapped to viewpoint templates (tables, forms, graphs) to produce
a particular semantic modeling application. 

In this adaptation, the adaptation code is stored in the model project's Git repository as a set
of files. In the future we hope to be able to package that adaptation code as a separate module that can be imported
apart from the target model data. Also, in this demo deployment, we use a local Fuseki database to host the model
data. The project build script includes logic to convert the model data from OML to OWL, perform reasoning on that
data to compute semantic inference entailments, and then loads that entire dataset into Fuseki from which the
OML Vision application can access it using SPARQL queries.

OML Vision is described by [NTR 52901](https://goto.jpl.nasa.gov/jplntr)

OML Vision's project summary is defined in [openCAESAR](https://www.opencaesar.io/projects/2023-05-29-OML-Vision.html)
