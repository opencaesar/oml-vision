import React, { useEffect, useState } from 'react';
import { postMessage } from '../utils/postMessage';
import { Commands } from '../../../commands/src/commands';
import { VscPlay } from 'react-icons/vsc'
import Loader from '../components/shared/Loader';

const SetupTasksView: React.FC = () => {
  const [isPreloading, setIsPreloading] = useState<boolean>(true);
  const [isLoadingGradleTasks, setIsLoadingGradleTasks] = useState<boolean>(true);
  const [gradleTasks, setGradleTasks] = useState<any>([]);

  useEffect(() => {
    setTimeout(() => {
      setIsPreloading(false);
    }, 500)

    postMessage({ command: Commands.GET_GRADLE_TASKS })
    const handler = (event: MessageEvent) => {
      const message = event.data;

      if (message.command === Commands.RECEIVED_GRADLE_TASKS) {
        const gradleTasks = message.payload;
        const results = gradleTasks || [];
        setGradleTasks(results);
        setIsLoadingGradleTasks(false);
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

  return (
    <div className={`setup-tasks-view ${isPreloading ?? "preload"}`}>
      <div className="setup-tasks-container scrollable">
        <div className="setup-tasks-container__none">
          <p className="my-[13px]">Run the proper Gradle tasks to setup the OML Vision environment:</p>
          <nav className="nav-list">
            <h2 className="nav-list__title nav-label">Gradle Tasks</h2>
            {/* @ts-ignore */}
            {!isLoadingGradleTasks ? gradleTasks.map(task => (
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

export default SetupTasksView;