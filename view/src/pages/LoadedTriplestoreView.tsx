import React, { useEffect, useState } from 'react';
import { postMessage } from '../utils/postMessage';
import { Commands } from '../../../commands/src/commands';
import { VscPlay } from 'react-icons/vsc'
import Loader from '../components/shared/Loader';

const LoadedTriplestoreView: React.FC = () => {
  const [isPreloading, setIsPreloading] = useState<boolean>(true);
  const [isPinging, setIsPinging] = useState<boolean>(true);
  const [loadedTriplestore, setLoadedTriplestore] = useState<boolean>(false);
  const [pingedTriplestore, setPingedTriplestore] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setIsPreloading(false);
    }, 500)

    postMessage({ command: Commands.CHECK_LOADED_TRIPLESTORE_TASK })
    const handler = (event: MessageEvent) => {
      const message = event.data;

      if (message.command === Commands.PING_TRIPLESTORE_TASK) {
        const pinged = message.payload;
        setPingedTriplestore(pinged);
        setIsPinging(false);
      }

      if (message.command === Commands.LOADED_TRIPLESTORE_TASK) {
        const loaded = message.payload;
        setLoadedTriplestore(loaded);
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  const runGradleTask = (task: string) => {
    postMessage({
      command: Commands.RUN_GRADLE_TASK,
      payload: task
    });
  }

  console.log("loadedTriplestore")
  console.log(loadedTriplestore)
  console.log("pingedTriplestore")
  console.log(pingedTriplestore)

  return (
    <div className={`setup-tasks-view ${isPreloading ?? "preload"}`}>
      <div className="setup-tasks-container scrollable">
        <div className="setup-tasks-container__none">
          <p className="my-[13px]"><a className="no-underline text-[#3792fa] hover:underline active:text-[#cccccc] underline" href="http://www.opencaesar.io/oml-vision-docs/">Read the official docs</a></p>
          <p className="my-[13px]">Run the proper Gradle tasks to setup the OML Vision environment:</p>
          <nav className="nav-list">
            <h2 className="nav-list__title nav-label">Gradle Tasks</h2>
            {/* @ts-ignore */}
            {!isPinging ? gradleTasks.map(task => (
              <button
                className="nav-list__item"
                title={`Run Gradle ${task}`}
                aria-label={`Run Gradle ${task}`}
                onClick={() => runGradleTask(task)}
              >
                <div className="nav-list__content">
                  <VscPlay />
                  <span className="nav-list__label">Run {task}</span>
                </div>
              </button>
            )): 
            <div className="flex justify-center mt-4">
              <Loader />
            </div>
            }
          </nav>
        </div>
      </div>
    </div>
  );
};

export default LoadedTriplestoreView;