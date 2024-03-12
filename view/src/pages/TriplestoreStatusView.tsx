import React, { useEffect, useState } from "react";
import { postMessage } from "../utils/postMessage";
import { Commands } from "../../../commands/src/commands";
import { VscDatabase, VscPlay } from "react-icons/vsc";
import Loader from "../components/shared/Loader";

const TriplestoreStatusView: React.FC = () => {
  const [loadedTriplestore, setLoadedTriplestore] = useState<boolean>(false);
  const [pingedTriplestore, setPingedTriplestore] = useState<boolean>(false);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;

      if (message.command === Commands.PING_TRIPLESTORE_TASK) {
        const pinged = message.payload;
        setPingedTriplestore(pinged.success);
      }

      if (message.command === Commands.LOADED_TRIPLESTORE_TASK) {
        const loaded = message.payload;
        setLoadedTriplestore(loaded.success);
      }
    };
    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
    };
  }, [pingedTriplestore, loadedTriplestore]);

  const runLoadedTriplestoreQueryTask = () => {
    postMessage({
      command: Commands.CHECK_LOADED_TRIPLESTORE_TASK,
    });
  };

  const showAlert = (text: string) => {
    postMessage({
      command: Commands.ALERT,
      text: text
    })
  }

  return (
    <div className={`loaded-triplestore-view`}>
      <div className="loaded-triplestore-container scrollable">
        <div className="loaded-triplestore-container__none">
          <nav className="nav-list">
            <h2 className="nav-list__title nav-label">RDF Triplestore</h2>
            {!pingedTriplestore ? (
              <div className="nav-list__content">
                {/* Used React Icons https://github.com/afzalsayed96/vscode-react-icons */}
                <svg
                  stroke="red"
                  fill="red"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1.293 8.395l1.414 1.414C3.211 9.305 3.759 8.859 4.329 8.45L2.9 7.021C2.34 7.443 1.796 7.891 1.293 8.395zM6.474 5.06L3.707 2.293 2.293 3.707l18 18 1.414-1.414-5.012-5.012.976-.975c-1.145-1.145-2.585-1.858-4.099-2.148L11.294 9.88c2.789-.191 5.649.748 7.729 2.827l1.414-1.414c-2.898-2.899-7.061-3.936-10.888-3.158L8.024 6.61C9.291 6.216 10.625 6 12 6c3.537 0 6.837 1.353 9.293 3.809l1.414-1.414C19.874 5.561 16.071 4 12 4 10.066 4.001 8.209 4.384 6.474 5.06zM3.563 11.293l1.414 1.414c.622-.622 1.319-1.132 2.058-1.551L5.576 9.697C4.859 10.148 4.181 10.676 3.563 11.293zM6.329 14.307l1.414 1.414c.692-.692 1.535-1.151 2.429-1.428l-1.557-1.557C7.782 13.115 7.003 13.633 6.329 14.307zM13.989 18.11l-2.1-2.1C10.838 16.069 10 16.933 10 18c-.001 1.104.895 2 2 2C13.066 20 13.931 19.162 13.989 18.11z"></path>
                </svg>
                <span className="nav-list__label">PING STATUS</span>
              </div>
            ) : (
              <div className="nav-list__content">
                {/* Used React Icons https://github.com/afzalsayed96/vscode-react-icons */}
                <svg
                  stroke="green"
                  fill="green"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 6c3.537 0 6.837 1.353 9.293 3.809l1.414-1.414C19.874 5.561 16.071 4 12 4 7.929 4.001 4.126 5.561 1.293 8.395l1.414 1.414C5.163 7.353 8.463 6 12 6zM17.671 14.307c-3.074-3.074-8.268-3.074-11.342 0l1.414 1.414c2.307-2.307 6.207-2.307 8.514 0L17.671 14.307z"></path>
                  <path d="M20.437,11.293c-4.572-4.574-12.301-4.574-16.873,0l1.414,1.414c3.807-3.807,10.238-3.807,14.045,0L20.437,11.293z"></path>
                  <circle cx="12" cy="18" r="2"></circle>
                </svg>
                <span className="nav-list__label">PING STATUS</span>
              </div>
            )}
            {/* We want to only check if the triplestore is loaded if the triplestore can be pinged */}
            {!loadedTriplestore ? (
              <div>
                <div className="nav-list__content">
                  <VscDatabase style={{ color: "red" }} />
                  <span className="nav-list__label">LOAD STATUS</span>
                </div>
                <button
                  className="nav-list__item"
                  title={`Triplestore Loaded Status`}
                  aria-label={`Check if triplestore is loaded`}
                  onClick={() => runLoadedTriplestoreQueryTask()}
                >
                  <div className="nav-list__content">
                    <VscPlay />
                    <span className="nav-list__label">
                      Check if triplestore is loaded
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div>
                <div className="nav-list__content">
                  <VscDatabase style={{ color: "green" }} />
                  <span className="nav-list__label">LOAD STATUS</span>
                </div>
                <button
                  className="nav-list__item"
                  title={`Triplestore Loaded Status`}
                  aria-label={`Check if triplestore is loaded`}
                  onClick={() => showAlert("Triplestore has data!")}
                >
                  <div className="nav-list__content">
                    <VscPlay />
                    <span className="nav-list__label">
                      Check if triplestore is loaded
                    </span>
                  </div>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TriplestoreStatusView;
