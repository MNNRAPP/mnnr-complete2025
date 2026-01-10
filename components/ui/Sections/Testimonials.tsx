'use client';

export default function BetaProgramCTA() {
  return (
    <section className="bg-blue-600 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Join Our Beta Program</h2>
        <p className="text-xl mb-8">
          Be among the first developers to use MNNR and help shape 
          the future of AI usage analytics.
        </p>
        <a 
          href="/signin/signup" 
          className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Start Free Beta →
        </a>
        <p className="text-sm text-blue-200 mt-4">
          No credit card required • 5-minute setup
        </p>
      </div>
    </section>
  );
}
