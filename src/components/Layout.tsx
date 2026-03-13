import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (headerRef.current) resizeObserver.observe(headerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- PERBAIKAN NAVIGASI & FILTER MENU ---
  const navItems = [
    { label: 'Beranda', href: '#hero' }, // Diubah ke ID agar bisa scroll
    { label: 'Opini', href: '#opinions' }, // Diubah ke ID agar bisa scroll
    ...(user ? [] : [{ label: 'Gabung', href: '#membership' }]), // Hilang jika user login
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        ref={headerRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full px-6 md:px-12 lg:px-16">
          <div className="flex items-center justify-between h-20">
            <motion.a
              href="/"
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                {/* TEMPAT LOGO PNG ABANG */}
                <img src="/genztalk.png" alt="Logo" className="w-full h-full object-cover" 
                     onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=GZ"; }} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent">
                Genztalk.id
              </span>
            </motion.a>

            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-2 bg-background/40 backdrop-blur-md border border-primary/20 rounded-full px-3 py-1.5">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="px-4 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/15 transition-all"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              {user && (
                <>
                  <div className="h-8 w-[1px] bg-primary/30 rounded-full" />
                  <div className="flex items-center gap-3 pl-2">
                    <span className="font-bold text-sm bg-gradient-to-r from-accent via-primary to-ring bg-clip-text text-transparent">
                      {user.user_metadata?.full_name?.split(' ')[0]}
                    </span>
                    <div 
                      onClick={handleLogout}
                      className="group relative cursor-pointer rounded-full p-[2px] bg-gradient-to-tr from-accent via-primary to-ring shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    >
                      <img 
                        src={user.user_metadata?.avatar_url} 
                        alt="Profile" 
                        className="w-9 h-9 rounded-full object-cover border-2 border-background group-hover:opacity-40 transition-opacity"
                      />
                      <LogOut className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 group-hover:opacity-100 z-10" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-foreground">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl"
            >
              <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-foreground/80 hover:text-primary font-medium py-2 pl-4 border-l-2 border-transparent hover:border-primary transition-all"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main style={{ paddingTop: `${headerHeight}px` }}>{children}</main>

      <footer className="relative border-t border-primary/20 bg-background/50 backdrop-blur-xl mt-24">
        {/* ... bagian footer tetap sama ... */}
      </footer>
    </div>
  );
}
