import React, { useState, useRef, useLayoutEffect } from 'react';
import { IconQuestion } from '@nasa-jpl/react-stellar';

const HelpIcon: React.FC<{helpText: string}> = ({helpText}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipBelow, setTooltipBelow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (tooltip) {
      const rect = tooltip.getBoundingClientRect();
      if (rect.top < 0) {
        setTooltipBelow(true);
      } else {
        setTooltipBelow(false);
      }
    }
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <button
        className="flex items-center justify-center w-4 h-4 border border-[color:var(--vscode-editor-foreground)] rounded-full"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <IconQuestion
          className="flex-shrink-0 flex-grow-0"
          width="15"
          height="15"
        />
      </button>
      <div ref={tooltipRef} className={`${!showTooltip && 'invisible'} z-10 w-[10rem] absolute left-1/2 transform -translate-x-1/2 bg-[color:var(--vscode-dropdown-listBackground)] text-[color:var(--vscode-list-deemphasizedForeground)] text-xxs rounded py-1 px-2 ${tooltipBelow ? 'top-full mt-2' : 'bottom-full mb-2'}`}>
        {helpText}
      </div>
    </div>
  );
};

export default HelpIcon;