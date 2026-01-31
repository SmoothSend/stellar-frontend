import { Github, Twitter, FileText, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background/10 backdrop-blur-sm mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/logo.svg"
                alt="SmoothSend Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">SmoothSend</h3>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Stellar Gasless</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-sm text-sm">
              Built for the future of Stellar payments. Send tokens without worrying about XLM gas fees.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/smoothsend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg bg-white/5"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/smoothsend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg bg-white/5"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://docs.smoothsend.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg bg-white/5"
              >
                <FileText className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-white/50">Developer</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.smoothsend.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/smoothsend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://stellar.smoothsend.xyz/api/v1/relayer/stellar/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Relayer API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-white/50">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:contact@smoothsend.xyz" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contact@smoothsend.xyz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/10 mt-12 pt-8 text-center max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © 2026 SmoothSend. Built for the future of Web3 payments.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
