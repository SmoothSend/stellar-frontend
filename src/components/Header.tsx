

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/50 border-b border-border/20">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img
              src="/logo.svg"
              alt="SmoothSend"
              className="relative h-8 w-8 md:h-10 md:w-10 object-contain bg-background rounded-lg p-1"
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter leading-none">SmoothSend</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Stellar Relayer</p>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8 mr-auto ml-12">
          <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Dashboard</a>
          <a href="https://docs.smoothsend.xyz" target="_blank" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Docs</a>
          <a href="https://github.com/smoothsend" target="_blank" className="text-sm font-medium text-white/60 hover:text-white transition-colors">GitHub</a>
        </nav>

        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </header>
  );
}
