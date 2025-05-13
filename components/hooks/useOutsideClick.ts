

import { useEffect, useRef } from 'react';

/**
 * This hook is not reusable - had to add an additional otherRef - useRef. Because 
 * popover is not always present
 * 
 *

 */
export default function useOutsideClick(callback: () => void) {
  const formBuilderRef = useRef<HTMLDivElement>(null);
  const propertiesRef = useRef<HTMLDivElement>(null);
  // This otherRef - it is for the popover component
  const otherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      
      if (formBuilderRef.current && !formBuilderRef.current.contains(event.target as Node) && 
          propertiesRef.current && !propertiesRef.current.contains(event.target as Node))
      /*!otherRef.current || otherRef.current && !otherRef.current.contains(event.target as Node)*/
      {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return [formBuilderRef,propertiesRef];
}