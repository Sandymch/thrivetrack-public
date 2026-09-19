import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./styles/base.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/workload.css";
import "./styles/wellbeing.css";
import "./styles/settings.css";
import "./amplify-config";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 *1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});


const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with id='root' was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);