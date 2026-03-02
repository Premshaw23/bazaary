"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white p-4">
                    <div className="glass max-w-md w-full p-8 rounded-3xl text-center space-y-6 animate-float">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-display font-bold text-slate-900">Something went wrong</h2>
                            <p className="text-slate-500 leading-relaxed">
                                We encountered an unexpected error. Don't worry, your data is safe.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="bg-slate-50 rounded-xl p-3 text-left overflow-auto max-h-32 border border-slate-100 italic">
                                <code className="text-xs text-red-600">
                                    {this.state.error.message}
                                </code>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="btn-premium w-full py-4 space-x-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            <span>Refresh Page</span>
                        </button>

                        <p className="text-xs text-slate-400">
                            If the problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
