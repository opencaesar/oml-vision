import React, { useMemo, useState, useEffect } from "react";

// Constructor for React states of cursor position X & Y
const [xPos, setXPos] = useState(0);
const [yPos, setYPos] = useState(0);

export const handlePointerMove = (e: React.PointerEvent) => {
    broadcastPointerPosition(e); 
}

// TODO: Break function up into Position X & Position Y
const broadcastPointerPosition = (e: React.PointerEvent) => {
    // Good for debugging
    console.log(e.clientX, e.clientY);

    // Set the X & Y Position of the cursor
    setXPos(e.clientX);
    setYPos(e.clientY);

    console.log(xPos)
    console.log(yPos)

    // TODO: Format xPos & yPos to cursors that animate

    // TODO: useMemo to improve performance
    return useMemo(() => {
        [xPos, yPos]
      }, [e.clientX, e.clientY]);
}
