import { createRootRoute, Outlet } from "@tanstack/react-router";

// eslint-disable-next-line react-refresh/only-export-components
const RootLayout = () => (
  <>
    <Outlet />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
