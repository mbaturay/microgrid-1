import { createBrowserRouter } from "react-router";
import { ExecutiveMode } from "@/app/pages/ExecutiveMode";
import { PractitionerMode } from "@/app/pages/PractitionerMode";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ExecutiveMode,
  },
  {
    path: "/project/:projectId",
    Component: PractitionerMode,
  },
]);
