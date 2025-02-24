import { createContext, useContext, useState } from "react";
import axios from "axios";


const API_URL = import.meta.env.MODE === "development" ? "http://localhost:4000/api/auth" : "/api/auth";
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [auth, setAuth] = useState(false);
    const [checkAuth, setCheckAuth] = useState(true);
    const [resError, setResError] = useState(null);
    const [res, setRes] = useState(null);

    const signup = async (fullname, email, password) => {
        setResError(null);
        try {
            const response = await axios.post(`${API_URL}/signup`, { fullname, email, password });
            setUser(response.data.user);
            setAuth(true);
        } catch (error) {
            setResError(error.response.data.message || "[ERROR] Signing up...");
            throw error;
        }
    };

    const signin = async (email, password) => {
        setResError(null);
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            setAuth(true);
            setUser(response.data.user);
        } catch (error) {
            setResError(error.response.data.message || "[ERROR] Signing in...");
            throw error;
        }
    };

    const signout = async () => {
        setResError(null);
        try {
            await axios.post(`${API_URL}/logout`);
            setAuth(false);
            setUser(null);
        } catch (error) {
            setResError(error.response.data.message || "[ERROR] Logging out...");
            throw error;
        }
    };

    const verifyEmail = async (code) => {
        setResError(null);
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code });
            setUser(response.data.user);
            setAuth(true);
            return response.data;
        } catch (error) {
            setResError(error.response.data.message || "[ERROR] Verifying email...");
            throw error;
        }
    };

    const checkedAuth = async () => {
        setCheckAuth(true);
        setResError(null);
        try {
            const response = await axios.get(`${API_URL}/check-auth`);
            setUser(response.data.user);
            setCheckAuth(false);
            setAuth(true);
        } catch (error) {
            setResError(null);
            setCheckAuth(false);
            setAuth(false);
        }
    };

    const forgotPassword = async (email) => {
        setResError(null);
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            setRes(response.data.message);
        } catch (error) {
            setResError(error.response.data.message || "Error sending reset password email");
            throw error;
        }
    };

    const resetPassword = async (token, password) => {
        setResError(null);
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            setRes(response.data.message);
        } catch (error) {
            setResError(error.response.data.message || "Error resetting password");
            throw error;
        }
    };

    return (
        <>
            <AuthContext.Provider value={{
                user,
                auth,
                checkAuth,
                resError,
                res,
                signup,
                signin,
                signout,
                verifyEmail,
                checkedAuth,
                forgotPassword,
                resetPassword
            }}>
                {children}
            </AuthContext.Provider>
        </>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
