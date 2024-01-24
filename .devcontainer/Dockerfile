# Use Debian 11 as the base image
FROM debian:11

# Install Node.js 18
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Java 17
RUN apt-get install -y openjdk-17-jdk

# Install TypeScript and npm
RUN npm install -g typescript

# Install Docker
RUN apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io

# Code Deprecated below - Installing VSCode extensions handled from devcontainer.json

# # Download repository and key
# RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
# RUN install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/microsoft-archive-keyring.gpg
# RUN sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/microsoft-archive-keyring.gpg] https://packages.microsoft.com/repos/vscode stable main" > /etc/apt/sources.list.d/vscode.list'

# # Install VSCode
# RUN apt-get update
# RUN apt-get install -y code

# # Install VSCode Extensions from CLI
# RUN code --user-data-dir='.' --install-extension eamodio.gitlens
# RUN code --user-data-dir='.' --install-extension esbenp.prettier-vscode
# RUN code --user-data-dir='.' --install-extension stackbreak.comment-divider
# RUN code --user-data-dir='.' --install-extension usernamehw.errorlens
# RUN code --user-data-dir='.' --install-extension mhutchie.git-graph
# RUN code --user-data-dir='.' --install-extension vscjava.vscode-gradle
# RUN code --user-data-dir='.' --install-extension vscjava.vscode-java-pack
# RUN code --user-data-dir='.' --install-extension wayou.vscode-todo-highlight
# RUN code --user-data-dir='.' --install-extension vscode-icons-team.vscode-icons
# RUN code --user-data-dir='.' --install-extension ms-azuretools.vscode-docker
# RUN code --user-data-dir='.' --install-extension rangav.vscode-thunder-client
# RUN code --user-data-dir='.' --install-extension rdfox.rdfox-rdf
# RUN code --user-data-dir='.' --install-extension Zazuko.sparql-notebook