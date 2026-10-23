import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button, ButtonLink } from '../components/ui/Button';
import { paths } from '../lib/routes';
import { ErrorLayout, NotFoundPage } from '../pages/NotFoundPage';

/** Generic, safe message. Never renders error details, stack traces or internal state. */
function SomethingWentWrong({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorLayout
      code="Something went wrong"
      title={
        <>
          An unexpected <em>reaction.</em>
        </>
      }
      actions={
        <>
          <Button icon="refresh" onClick={onRetry}>
            Try again
          </Button>
          <ButtonLink to={paths.home} variant="secondary">
            Return to Homepage
          </ButtonLink>
          <ButtonLink to={paths.contact} variant="ghost">
            Contact Biotonic
          </ButtonLink>
        </>
      }
    >
      <p>
        This page could not be displayed. Please try again — if the problem continues, return to the
        homepage or contact us.
      </p>
    </ErrorLayout>
  );
}

/** React Router `errorElement`: handles 404 responses and errors thrown while rendering a route. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  if (import.meta.env?.DEV) console.error(error);
  return <SomethingWentWrong onRetry={() => window.location.reload()} />;
}

/** Last-resort boundary around the whole application (outside the router). */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env?.DEV) console.error(error, info.componentStack);
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="fatal-error">
        <h1>Something went wrong</h1>
        <p>Please reload the page. If the problem continues, return to the homepage.</p>
        <p>
          <a href="/">Return to Homepage</a>
        </p>
      </main>
    );
  }
}
