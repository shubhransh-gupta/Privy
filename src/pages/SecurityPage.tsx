import { useDocumentTitle } from '../hooks/useKeyboardShortcut'

export function SecurityPage() {
  useDocumentTitle('Privacy & Security')

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <span className="text-4xl">🔒</span>
        <h1 className="text-3xl font-bold mt-4">Privacy & Security</h1>
        <p className="text-zinc-400 mt-2">Your files never leave your device.</p>
      </div>

      <div className="space-y-6">
        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-2">Local Processing</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Files are processed using browser APIs whenever possible — Canvas, Web Crypto, File API,
            and Web Workers. Heavy libraries like PDF.js and pdf-lib run entirely in your browser tab.
          </p>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-2">No Uploads</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Core file tools don't send files to any server. There is no upload endpoint. Your PDFs,
            images, CSVs, and documents stay on your machine.
          </p>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-2">No Accounts</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            You don't need to create an account. Favorites and recent tools are stored in your
            browser's localStorage — never on a remote server.
          </p>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-2">Open Source</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The implementation can be inspected on{' '}
            <a href="https://github.com/shubhransh-gupta/Privy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            . We encourage security researchers to review the code.
          </p>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-2">No Analytics</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            LocalTools does not include third-party analytics by default. We don't track what files
            you process or what data you enter.
          </p>
        </section>

        <section className="glass-card p-6 border-amber-500/20">
          <h2 className="text-lg font-semibold mb-2 text-amber-400">Limitations</h2>
          <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
            <li>Browser memory limits apply to very large files (typically 500MB+)</li>
            <li>PDF compression in-browser has limited options compared to server-side tools</li>
            <li>Invoice parsing uses pattern matching — results may not be perfect</li>
            <li>JWT decoding does NOT verify signatures — use for inspection only</li>
            <li>Some AVIF encoding may not be supported in all browsers</li>
            <li>Salary/tax calculations are estimates, not tax advice</li>
          </ul>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-2">Offline Support</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            LocalTools is a Progressive Web App. After your first visit, you can install it and use
            most tools offline. Look for "Install LocalTools" in your browser menu.
          </p>
          <p className="text-xs text-emerald-400 mt-3">✓ Available Offline</p>
        </section>
      </div>
    </div>
  )
}
