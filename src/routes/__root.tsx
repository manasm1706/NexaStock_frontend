import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

import { WifiOff, ShieldAlert, KeyRound, ServerCrash, RotateCw, Home } from "lucide-react";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const errMsg = error?.message || "";
  
  let errorType: "session" | "network" | "server" | "access" | "generic" = "generic";
  let title = "An unexpected error occurred";
  let description = "Something went wrong on our end. You can try refreshing the page or contact support if the issue persists.";
  let Icon = ServerCrash;

  if (
    errMsg.toLowerCase().includes("session expired") || 
    errMsg.toLowerCase().includes("unauthorized") || 
    errMsg.toLowerCase().includes("jwt expired") ||
    errMsg.toLowerCase().includes("token expired") ||
    errMsg.toLowerCase().includes("401")
  ) {
    errorType = "session";
    title = "Session Expired";
    description = "Your active session has expired. Please sign in again to restore access to your dashboard.";
    Icon = KeyRound;
  } else if (
    errMsg.toLowerCase().includes("network error") || 
    errMsg.toLowerCase().includes("failed to fetch") || 
    errMsg.toLowerCase().includes("internet connection") ||
    errMsg.toLowerCase().includes("offline")
  ) {
    errorType = "network";
    title = "Network Connection Issue";
    description = "We couldn't connect to our servers. Please check your internet connection and try again.";
    Icon = WifiOff;
  } else if (
    errMsg.toLowerCase().includes("503") || 
    errMsg.toLowerCase().includes("502") || 
    errMsg.toLowerCase().includes("504") || 
    errMsg.toLowerCase().includes("server unavailable") ||
    errMsg.toLowerCase().includes("internal server error")
  ) {
    errorType = "server";
    title = "Server Temporarily Unavailable";
    description = "Our servers are experiencing temporary difficulties. Please try again in a few moments.";
    Icon = ServerCrash;
  } else if (
    errMsg.toLowerCase().includes("forbidden") || 
    errMsg.toLowerCase().includes("access denied") || 
    errMsg.toLowerCase().includes("403") || 
    errMsg.toLowerCase().includes("not authorized")
  ) {
    errorType = "access";
    title = "Access Denied";
    description = "You do not have the required permissions to view this resource. If you believe this is an error, please contact your administrator.";
    Icon = ShieldAlert;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 px-4 select-none">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl">
        {/* Sleek background glowing gradient */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-indigo-400 mb-6 shadow-inner">
            <Icon className="h-8 w-8 animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            {title}
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row w-full gap-3 justify-center">
            {errorType === "session" ? (
              <a
                href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/dashboard")}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all px-6 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98]"
              >
                <KeyRound className="h-4 w-4" />
                Sign In Again
              </a>
            ) : (
              <button
                onClick={() => {
                  router.invalidate();
                  reset();
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all px-6 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
              >
                <RotateCw className="h-4 w-4 animate-spin-hover" />
                Try Again
              </button>
            )}
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm transition-all px-6 active:scale-[0.98]"
            >
              <Home className="h-4 w-4" />
              Go Home
            </a>
          </div>
          
          {errorType !== "session" && (
            <span className="text-[10px] text-zinc-600 mt-6 block">
              Error code/message: {errMsg.substring(0, 100) || "Unknown Details"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NexaStock — AI-powered retail intelligence" },
      { name: "description", content: "Warehouse-first, AI-driven inventory and retail intelligence platform for modern multi-store businesses." },
      { name: "author", content: "NexaStock" },
      { property: "og:title", content: "NexaStock" },
      { property: "og:description", content: "The operations brain for modern multi-store retail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml;utf8," + encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><defs><linearGradient id='g' x1='0' y1='0' x2='40' y2='40' gradientUnits='userSpaceOnUse'><stop offset='0%' stop-color='%2386a8ff'/><stop offset='100%' stop-color='%237c5cff'/></linearGradient></defs><rect x='1' y='1' width='38' height='38' rx='11' fill='url(%23g)'/><g fill='white'><circle cx='12' cy='12' r='3.2'/><circle cx='28' cy='28' r='3.2'/></g><path d='M12 12 L12 28 L28 12 L28 28' stroke='white' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>`
        ),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId="1054113477349-stcda9foj6atinjdlchr5ouh51n5kj2u.apps.googleusercontent.com">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}
