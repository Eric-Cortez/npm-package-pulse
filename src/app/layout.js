import "@/src/app/styles.css";
import Header from "@/src/components/Header.jsx";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it
export const dynamic = "force-dynamic";
// Metadata for the application
export const metadata = {
  title: "NPM Package Pulse",
  description:
    "NPM Package Pulse is a package review website built with Next.js and Firebase.",
};
// Root layout component
export default async function RootLayout({ children }) {
  // Get the authenticated user (if any)
  const { currentUser } = await getAuthenticatedAppForUser();
  // Render the HTML structure with Header and main content
  return (
    <html lang="en">
      <body>
        <Header initialUser={currentUser?.toJSON()} />

        <main>{children}</main>
      </body>
    </html>
  );
}
