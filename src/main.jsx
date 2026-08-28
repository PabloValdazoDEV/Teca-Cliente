import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import "@/index.css";
import App from "@/App.jsx";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

// One-time migration cleanup for the previous JavaScript-readable JWT cookie.
document.cookie = "token=; Max-Age=0; Path=/; SameSite=Strict";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
