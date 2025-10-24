import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./app/globals.css";
import Home from "./app/page";
import MapPage from "./app/map/page";
import ReportsPage from "./app/reports/page";
import SightingsPage from "./app/sightings/page";
import SightingDetailPage from "./app/sightings/[id]/page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "map", element: <MapPage /> },
      { path: "sightings", element: <SightingsPage /> },
      { path: "sightings/:id", element: <SightingDetailPage /> },
      { path: "reports", element: <ReportsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
