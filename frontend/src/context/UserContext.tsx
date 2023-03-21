import { createContext } from "react";
import { ContainerProps } from "../components/interfaces/ContainerPropsInterface";
import { UserInterface } from "../components/interfaces/UserInterface";

import useAuth from "../hooks/useAuth";

interface ContextType {
    register: (user: UserInterface) => Promise<void>;
}

const Context = createContext<ContextType>({
    register: () => Promise.resolve(),
});

// const Context = createContext()

function UserProvider({ children }: ContainerProps) {

    const { register } = useAuth()

    return (
        <Context.Provider value={{ register }}>
            {children}
        </Context.Provider>
    )
}

export { Context, UserProvider }