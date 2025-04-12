import { Route } from "wouter";

/**
 * A simplified Protected Route component that doesn't check authentication.
 * This is for development and demonstration purposes only.
 * In a production environment, this would check if the user is authenticated.
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Direct access to the component
  return <Route path={path} component={Component} />;
}