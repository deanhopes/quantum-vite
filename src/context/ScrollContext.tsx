import {createContext, useContext} from "react"

interface ScrollContextType {
    scrollProgress: number
    isHorizontalSection: boolean
}

const ScrollContext = createContext<ScrollContextType>({
    scrollProgress: 0,
    isHorizontalSection: false,
})

export const useScrollContext = () => {
    const context = useContext(ScrollContext)
    if (context === undefined) {
        throw new Error(
            "useScrollContext must be used within a ScrollContextProvider"
        )
    }
    return context
}

interface ScrollContextProviderProps {
    children: React.ReactNode
    value: ScrollContextType
}

export const ScrollContextProvider = ({
    children,
    value,
}: ScrollContextProviderProps) => {
    return (
        <ScrollContext.Provider value={value}>
            {children}
        </ScrollContext.Provider>
    )
}
