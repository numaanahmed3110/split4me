import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Routes that require a signed-in user.
 *
 * Everything under `/groups` is the product itself -- listing, viewing,
 * creating and editing groups and expenses -- so it is gated wholesale. Before
 * this, `clerkMiddleware()` ran without a callback, which authenticates the
 * request but protects nothing, so anyone could read and write any group.
 *
 * `/api/trpc` and `/api/voice` are deliberately absent. They enforce
 * authentication themselves (`protectedProcedure` and an explicit `auth()`
 * check respectively) and have to answer with JSON -- tRPC's `UNAUTHORIZED` or a
 * 401 -- rather than the sign-in redirect `auth.protect()` issues for document
 * requests, which their callers cannot parse.
 *
 * `/` stays public as the landing page, along with `/sign-in`, `/sign-up`, the
 * health endpoints and the crawler metadata. Static files (including
 * `/offline.html` and `/sw.js`, which the PWA needs while signed out) never
 * reach this middleware -- the matcher below excludes them by extension.
 */
const isProtectedRoute = createRouteMatcher([
  '/groups(.*)',
  '/settings(.*)',
  '/api/s3-upload(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
}
