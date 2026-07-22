import { createFileRoute } from "@tanstack/react-router";
import PPTViewPage from "../../pages/ppt/viewpage";

export const Route = createFileRoute("/ppt/$slug")({
  component: PPTViewPage,
});
