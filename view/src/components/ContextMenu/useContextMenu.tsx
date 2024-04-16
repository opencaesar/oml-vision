import { useState, useEffect, useRef } from "react";

const useContextMenu = () => {
  const [rightClick, setRightClick] = useState(false);
  const [coordinates, setCoordinates] = useState({
    x: 0,
    y: 0,
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: any) => {
    setRightClick(false);
  };

  // Initially set context menu to off
  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // return right click, coordinates states, and context menu ref
  return {
    rightClick,
    setRightClick,
    coordinates,
    setCoordinates,
    contextMenuRef,
  };
};

export default useContextMenu;
