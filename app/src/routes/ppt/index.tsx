import { createFileRoute } from "@tanstack/react-router";
import { PPTCreatePage } from "../../pages/ppt/create";

export const Route = createFileRoute("/ppt/")({
  component: PPTCreatePage,
});
