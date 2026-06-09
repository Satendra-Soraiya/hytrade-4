import Link from "next/link"
import { Lock } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 py-16 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Hytrade" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-muted-foreground">
              NSE paper trading with INR wallets — practice before you invest.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Products</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Trading</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">NSE equities</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Paper wallet</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Portfolio tracking</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Watchlists</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link></li>
              <li><Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">Sign up</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">© {currentYear} Hytrade. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 md:mt-0">
            <Lock className="h-4 w-4" />
            Paper trading only — no real money
          </div>
        </div>

        <div className="py-8 border-t border-border text-xs text-muted-foreground leading-relaxed">
          <p>
            <strong>Risk disclaimer:</strong> Hytrade is a simulated trading platform for education and practice.
            Past performance does not guarantee future results. This is not investment advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
