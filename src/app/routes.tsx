import { createBrowserRouter } from "react-router";
import { PortfolioPage } from "@/app/pages/PortfolioPage";
import { ProjectPage } from "@/app/pages/ProjectPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PortfolioPage,
  },
  {
    path: "/project/:projectId",
    Component: ProjectPage,
  },
]);
