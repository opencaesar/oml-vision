'use client'

import React, { useEffect, useRef } from 'react'

function Modal({
  children,
  className,
  onClickOutside,
  isFull = false,
}: {
  children: JSX.Element
  className?: string
  onClickOutside?: () => void
  isFull?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let startClickOutside = false; // This variable is now contained within the effect.

    const checkClick = (event: MouseEvent) => {
      const isOutside =
        (ref.current &&
        // @ts-ignore
        !ref.current.contains(event.target)) ?? false;

      if (event.type === 'mousedown') {
        startClickOutside = isOutside;
      } else if (event.type === 'mouseup' && startClickOutside && isOutside) {
        onClickOutside?.();
      }
    };

    document.addEventListener('mousedown', checkClick, true);
    document.addEventListener('mouseup', checkClick, true);

    return () => {
      document.removeEventListener('mousedown', checkClick, true);
      document.removeEventListener('mouseup', checkClick, true);
    };
  }, []);

  const modalStyle = isFull
    ? 'max-h-[100vh]'
    : 'max-h-[90vh] custom-box-shadow rounded-md'

  return (
    <div className='fixed z-10 top-0 bottom-0 right-0 left-0 inset-0 bg-[#000] bg-opacity-40 flex justify-center items-center overflow-y-hidden scrollbar-none'>
      <div
        ref={ref}
        className={`${modalStyle} overflow-y-auto scrollbar-none bg-[var(--vscode-editor-background)] ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
