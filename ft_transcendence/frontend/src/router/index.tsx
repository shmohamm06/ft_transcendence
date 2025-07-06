import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import GamePage from "../pages/GamePage";
import SettingsPage from "../pages/SettingsPage";
import TicTacToePage from "../pages/TicTacToePage";
import TournamentPage from "../pages/TournamentPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/game" element={
                        <ProtectedRoute>
                            <GamePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/tournament" element={
                        <ProtectedRoute>
                            <TournamentPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/tictactoe" element={
                        <ProtectedRoute>
                            <TicTacToePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default AppRouter;
