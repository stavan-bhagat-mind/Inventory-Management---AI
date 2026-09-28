import { useEffect, useRef } from 'react';

export const useOutClick = (handler) => {
  const domNodeRef = useRef(null);

  useEffect(() => {
    const maybeHandler = (event) => {
      if (domNodeRef.current && !domNodeRef.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', maybeHandler);
    document.addEventListener('touchstart', maybeHandler);

    return () => {
      document.removeEventListener('mousedown', maybeHandler);
      document.removeEventListener('touchstart', maybeHandler);
    };
  }, [handler]);

  return domNodeRef;
};
