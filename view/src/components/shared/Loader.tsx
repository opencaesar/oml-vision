import React from 'react';

interface LoaderProps {
  message?: string;
  className?: string;
}
const Loader: React.FC<LoaderProps> = ({ message = "", className }) => {
  return (
    <div className={`flex flex-col justify-center items-center ${className}`}>
      {message && <p className="mb-4 text-lg text-[color:var(--vscode-foreground)]">{message}</p>}
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-[color:var(--vscode-foreground)] motion-reduce:animate-[spin_1.5s_linear_infinite]">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading..
        </span>
      </div>
    </div>
  );
};

export default Loader;