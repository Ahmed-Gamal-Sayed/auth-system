import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuth } from "./Context/authContext";
import Home from "./Component/home";
import Signup from "./Component/signup";
import ForgetPassword from "./Component/forgetPassword";
import ResetPassword from "./Component/resetPassword";
import VerifyEmail from "./Component/verifyEmail";
import Signin from "./Component/signin";
import Dashboard from "./Component/dashboard";


export default function App() {
    const { auth, user, checkAuth, checkedAuth } = useAuth();


    useEffect(() => {
        checkedAuth();
    }, [checkAuth]);

    const ProtectedRoute = ({ children }) => {
        if (!auth) { return <Navigate to='/signin' replace />; }
        if (!user.isVerified) { return <Navigate to='/verify-email' replace />; }
        return children;
    };

    const RedirectAuthenticatedUser = ({ children }) => {
        if (auth && user.isVerified) { return <Navigate to='/' replace />; }
        return children;
    };

    return (
        <>
            <div
                className='min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 
                flex items-center justify-center relative overflow-hidden'
            >
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path='/dashboard'
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path='/signup'
                        element={
                            <RedirectAuthenticatedUser>
                                <Signup />
                            </RedirectAuthenticatedUser>
                        }
                    />
                    <Route
                        path='/signin'
                        element={
                            <RedirectAuthenticatedUser>
                                <Signin />
                            </RedirectAuthenticatedUser>
                        }
                    />
                    <Route path='/verify-email' element={<VerifyEmail />} />
                    <Route
                        path='/forget-password'
                        element={
                            <RedirectAuthenticatedUser>
                                <ForgetPassword />
                            </RedirectAuthenticatedUser>
                        }
                    />

                    <Route
                        path='/reset-password/:token'
                        element={
                            <RedirectAuthenticatedUser>
                                <ResetPassword />
                            </RedirectAuthenticatedUser>
                        }
                    />
                    <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>
                <Toaster />
            </div>
        </>
    );
}
