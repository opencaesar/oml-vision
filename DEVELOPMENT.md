
# How to Start VSCode Extension in Dev mode

## Windows
1. Install scoop https://scoop.sh/#/
2. Use scoop to install `git`, `nodejs`, `nvm`, `yarn`, `java17` and `visual studio code` if not already installed.
```bash
scoop bucket add main
scoop bucket add extras
scoop bucket add java
scoop install main/git
scoop install main/nodejs
scoop install main/nvm
scoop install main/yarn
scoop install java/openjdk17
scoop install extras/vscode
```
3. The version of VSCode must be at `1.78.2` or newer.
4. Install the following VSCode extensions if not already installed
```bash
code --install-extension vscjava.vscode-java-pack
code --install-extension vscjava.vscode-gradle
```
5. Clone OML Vision into your workspace `git clone https://github.com/opencaesar/oml-vision.git`
6. Open OML Vision in VSCode
7. Press F5 on your Keyboard or Ctrl+Shift+D (Windows) or Cmd+Shift+D (macOS) and click the green play button in the upper left that says `Run Extension`.  This takes care of building the application in Dev Mode. 
8. Open the OML repo in Dev mode of OML Vision. 
9.  important note: you can’t have the same OML repo open in another instance of vscode. If you try to open a folder in the vision app that is already open in another instance of vscode it just quietly does nothing.
10. Click the eye in the left hand side which corresponds to OML Vision or click the ellipsis at the bottom of the sidebar which will expand a selection menu.  Select `OML Vision` from there.

## macOS
1. Install homebrew https://brew.sh
2. Use scoop to install `git`, `nodejs`, `nvm`, `yarn` and `visual studio code` if not already installed.
```bash
brew install git
brew install nodejs
brew install nvm
brew install yarn
brew install openjdk@17
brew install --cask visual-studio-code
```
3. The version of VSCode must be at `1.78.2` or newer.
4. Install the following VSCode extensions
```bash
code --install-extension vscjava.vscode-java-pack
code --install-extension vscjava.vscode-gradle
```
5. Clone OML Vision into your workspace `git clone https://github.com/opencaesar/oml-vision.git`
6. Open OML Vision in VSCode
7. Press F5 on your Keyboard or Ctrl+Shift+D (Windows) or Cmd+Shift+D (macOS) and click the green play button in the upper left that says `Run Extension`.  This takes care of building the application in Dev Mode. 
8. Open the OML repo in Dev mode of OML Vision. 
9. important note: you can’t have the same OML repo open in another instance of vscode. If you try to open a folder in the vision app that is already open in another instance of vscode it just quietly does nothing.
10. Click the eye in the left hand side which corresponds to OML Vision or click the ellipsis at the bottom of the sidebar which will expand a selection menu.  Select `OML Vision` from there.

## Troubleshooting
Known issues:
- If startFusekiVision exits with error and you see in .fuseki.log that Fuseki is running at port 3030 already, do the following:
- Solution:
1. `lsof -i :[port of running fuseki process]`
2. Find the PID of the running fuseki process from the result
3. Kill the fuseki process: `kill [pid]`
4. Re-run the gradle task (whether it was owlLoadVision or startFusekiVision)

# Debugging

## Debug commands and controller 
1. Add a [breakpoint](https://code.visualstudio.com/docs/editor/debugging#_breakpoints) to a line of code in the `commands` or `controller` folder
2. Run VSCode Extension in Development mode
3. Breakpoints will allow you to see the stack trace of a line of code in a program within the `commands` or `controller` folder

## Debug views
1. Run VSCode Extension in Development mode
2. Hit Ctrl + Shift + P or Cmd + Shift + P to open the VSCode Command Palette
3. Search for `Developer: Open Webview Developer Tools`
4. The developer tools allows you to inspect elements in the webview that come from the `view` folder like a typical React web application
5. You can view an example of someone debugging a VSCode Code Extension Webview [here](https://dzhavat.github.io/2020/11/12/easy-way-to-debug-a-webview-in-a-vscode-extension.html)

## Open Web Query Fuseki UI
1. Open any browser and go to the following URL http://localhost:3030/

## How to view log files in Fuseki Server 
1. Go into the .fuseki/fuseki.log file
2. Should see POST API calls 