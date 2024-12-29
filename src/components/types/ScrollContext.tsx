import React from 'react';

export interface ScrollContextType {
    scrollProgress: number;
    isHorizontalSection: boolean;
}

export const ScrollContext = React.createContext<ScrollContextType>({
    scrollProgress: 0,
    isHorizontalSection: false,
});

export const useScrollContext = () => React.useContext(ScrollContext); 