export const metadata = {
  title: "About | HYtrade",
  description: "Learn about HYtrade and our mission.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About HYtrade</h1>
        <p className="mt-4 text-muted-foreground leading-7">
          HYtrade helps you analyze markets, manage portfolios, and make informed trading decisions with
          a modern, AI-assisted experience. We care about performance, usability, and privacy.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold">Our Mission</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Build a trustworthy trading platform that is fast, intuitive, and accessible.
            </p>
          </div>
          <div className="rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold">What Were Building</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From research to execution, HYtrade aims to simplify your workflow with integrated tools and insights.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
