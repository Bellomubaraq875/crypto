import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import "@fontsource-variable/manrope";
import App from "./App.jsx";
import { store } from "./App/store";
import { AppProvider } from "./context/AppContext";
import ErrorBoundary from "./Components/ErrorBoundary";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
        <ErrorBoundary>
          <AppProvider>
            <App />
          </AppProvider>
        </ErrorBoundary>
      </Provider>
    </Router>
  </StrictMode>
);
