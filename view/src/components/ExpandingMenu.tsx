import React, { SVGProps } from "react";
import { postMessage } from "../utils/postMessage";
import { Commands } from "../../../commands/src/commands";

export default function ExpandingMenu({ title, icon, buttons: links }: { title: string, icon: ((props: SVGProps<SVGSVGElement>) => any) | { url: string }, buttons: { text: string, redirect?: { title: string, path: string }, onClick?: Function }[] }): JSX.Element {

  const linkElements: JSX.Element[] = links.map(btn => <button className="float-left w-full h-fit p-1.5 pl-4 text-base text-left text-[color:var(--vscode-settings-textInputForeground)] rounded-sm bg-transparent hover:bg-[color:var(--vscode-welcomePage-tileHoverBackground)]" onClick={(event) => {
    if (btn.redirect) {
      postMessage({
        command: Commands.CREATE_TABLE,
        payload: {
          title: btn.redirect.title,
          path: btn.redirect.path
        }
      });
    }
    if (btn.onClick) {
      btn.onClick(event);
    }
  }} style={{ outline: "none" }}>{btn.text}</button>);

  // TODO: handle icon coloring, right now it's only set to white/inverted
  return (
    <div className="float-left p-4 w-80 h-fit">
      <div className="w-full h-max rounded-t-xl overflow-auto p-1 text-[color:var(--vscode-settings-textInputForeground)] bg-[color:var(--vscode-banner-background)] border border-[color:var(--vscode-editor-foreground)]">
        {'url' in icon ?
          (<img src={icon.url} className="float-left p-3 w-1/3 h-full clear-none align-middle invert" />) :
          icon({ className: "float-left p-2 w-1/3 h-full clear-none align-middle invert" })
        }
        <h2 className="break-normal font-bold text-xl">{title}</h2>
      </div>
      <div className="relative float-left w-full h-fit place-self-center rounded-b-xl overflow-hidden bg-[color:var(--vscode-banner-background)] border border-t-0 border-[color:var(--vscode-editor-foreground)]">{linkElements}</div>
    </div>
  );
}
