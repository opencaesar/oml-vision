import React from "react";

export const handlePointerMove = (e: React.PointerEvent) => {
    broadcastPointerPosition(e); 
}

const broadcastPointerPosition = (e: React.PointerEvent) => {
    console.log(e.clientX, e.clientY);
}
