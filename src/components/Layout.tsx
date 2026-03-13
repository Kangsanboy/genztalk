import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut } from 'lucide-react'; // Tambah ikon LogOut
import { ROUTE_PATHS } from '@/lib/index';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient'; // Panggil jembatan database

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  
  // State untuk nyimpen data user di Navbar
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Ambil data user buat nampilin profil
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

  const navItems = [
    { label: 'Beranda', href: ROUTE_PATHS.HERO },
    { label: 'Opini', href: ROUTE_PATHS.OPINIONS },
    { label: 'Gabung', href: ROUTE_PATHS.MEMBERSHIP },
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        ref={headerRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
            : 'bg-transparent'
        }`}
      >
        {/* Kontainer diubah jadi lebih lebar biar merapat ke pinggir */}
        <div className="w-full px-6 md:px-12 lg:px-16">
          <div className="flex items-center justify-between h-20">
            
            {/* BAGIAN KIRI: LOGO GAMBAR + TEKS */}
            <motion.a
              href={ROUTE_PATHS.HOME}
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Tempat Gambar Logo (Placeholder) */}
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all">
                {/* NANTI TINGGAL GANTI BARIS DI BAWAH INI SAMA TAG <img src="link-logo-abang.png" /> */}
                <span className="text-xs font-black text-primary">GZ</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent">
                Genztalk.id
              </span>
            </motion.a>

            {/* BAGIAN TENGAH/KANAN: MENU + PROFIL */}
            <div className="hidden md:flex items-center gap-6">
              
              {/* Menu Estetik Kapsul */}
              <nav className="flex items-center gap-2 bg-background/40 backdrop-blur-md border border-primary/20 rounded-full px-3 py-1.5 shadow-inner">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-4 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/15 transition-all duration-300"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              {/* Garis Pembatas (Kalau Login) */}
              {user && <div className="h-8 w-[1px] bg-primary/30 rounded-full" />}

              {/* Profil User */}
              {user && (
                <div className="flex items-center gap-3 pl-2">
                  <span className="font-bold text-sm bg-gradient-to-r from-accent via-primary to-ring bg-clip-text text-transparent">
                    {user.user_metadata?.full_name?.split(' ')[0]} {/* Ambil nama depan aja biar rapi */}
                  </span>
                  <div 
                    onClick={handleLogout}
                    className="group relative cursor-pointer rounded-full p-[2px] bg-gradient-to-tr from-accent via-primary to-ring shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-300"
                    title="Klik untuk Logout"
                  >
                    <img 
                      src={user.user_metadata?.avatar_url} 
                      alt="Profile" 
                      className="w-9 h-9 rounded-full object-cover border-2 border-background group-hover:opacity-40 transition-opacity"
                    />
                    <LogOut className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  </div>
                </div>
              )}
            </div>

            {/* TOMBOL MENU MOBILE */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* MENU MOBILE ... (Sama seperti sebelumnya) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl"
            >
              <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-foreground/80 hover:text-primary font-medium py-2 pl-4 border-l-2 border-transparent hover:border-primary transition-all"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main style={{ paddingTop: `${headerHeight}px` }}>{children}</main>

      <footer className="relative border-t border-primary/20 bg-background/50 backdrop-blur-xl mt-24">
        {/* ISI FOOTER SAMA SEPERTI SEBELUMNYA */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent mb-4">Genztalk.id</h3>
              <p className="text-muted-foreground text-sm">Platform tempat Gen Z menyuarakan opini dan diskusi. Suaramu, Panggungmu.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Navigasi</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}><a href={item.href} className="text-muted-foreground hover:text-primary text-sm">{item.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Kontak</h4>
              <p className="text-muted-foreground text-sm mb-2">Email: hello@genztalk.id</p>
              <p className="text-muted-foreground text-sm">Follow kami di media sosial</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary/10 text-center">
            <p className="text-muted-foreground text-sm">© 2026 Genztalk.id. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
