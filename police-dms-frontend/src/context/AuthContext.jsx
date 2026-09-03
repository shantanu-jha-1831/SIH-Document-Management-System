import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (error) {
                localStorage.removeItem("user");
                return null;
            }
        }

        return null;
    });

    // ===============================
    // LOGIN
    // ===============================
    const login = (userData) => {

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    };

    // ===============================
    // LOGOUT
    // ===============================
    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);
    };

    // ===============================
    // AUTHENTICATION CHECK
    // ===============================
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}