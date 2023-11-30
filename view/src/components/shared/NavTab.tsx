import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavTabProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

const NavTab: React.FC<NavTabProps> = ({ to, className, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    navigate(to);
  };

  const isActive = location.pathname === to;
  const activeClass = isActive ? 'bg-[color:var(--vscode-list-hoverBackground)] text-[color:var(--vscode-list-activeSelectionForeground)]' : 'bg-[color:var(--vscode-panel-background)]';

  return (
    <button
      onClick={handleClick}
      className={
        `${className} ${activeClass}
        flex items-center w-full p-3
        hover:bg-[color:var(--vscode-list-hoverBackground)]
        hover:text-[color:var(--vscode-list-activeSelectionForeground)]
        active:bg-[color:var(--vscode-list-activeSelectionBackground)]`
      }
    >
      {children}
    </button>
  );
};

export default NavTab;