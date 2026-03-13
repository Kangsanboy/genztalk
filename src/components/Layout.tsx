import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, Instagram, Mail, Sun, Moon, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { ThemeProvider, useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8 md:w-9 md:h-9" />; 
  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all border border-primary/20 shadow-sm"
      title="Ganti Tema"
    >
      {currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // State untuk dropdown profil
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
    localStorage.removeItem('admin_mode'); // Keluar dari mode admin juga kalau logout
    await supabase.auth.signOut();
  };

  const handleAdminLogin = () => {
    setShowProfileMenu(false);
    const pin = prompt("Masukkan PIN Keamanan Admin:");
    if (pin === "12345") { // Ganti PIN ini sesuai keinginan Abang nanti
      localStorage.setItem('admin_mode', 'true');
      alert("Berhasil masuk Mode Admin!");
      window.location.reload(); // Refresh halaman biar data aduan muncul
    } else {
      alert("PIN Salah Bang! Anda bukan Admin.");
    }
  };

  const handleKeluarAdmin = () => {
    setShowProfileMenu(false);
    localStorage.removeItem('admin_mode');
    alert("Keluar dari Mode Admin.");
    window.location.reload();
  }

  // Cek apakah sedang mode admin
  const isAdmin = typeof window !== 'undefined' ? localStorage.getItem('admin_mode') === 'true' : false;

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
    { label: 'Beranda', href: '#hero' },
    { label: 'Filosofi', href: '#filosofi' },
    { label: 'Kegiatan', href: '#events' },
    { label: 'Opini', href: '#opinions' },
    ...(user ? [] : [{ label: 'Gabung', href: '#membership' }]), 
  ];

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
        <motion.header
          ref={headerRef}
          initial={{ y: -100 }} animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'bg-transparent'
          }`}
        >
          <div className="w-full px-4 md:px-12 lg:px-16">
            <div className="flex items-center justify-between h-20">
              
              <motion.a href="/" className="flex items-center gap-2 md:gap-3 group" whileHover={{ scale: 1.02 }}>
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center overflow-hidden">
                  <img src="/genztalk.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=GZ"; }} />
                </div>
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent truncate">
                  Genztalk.id {isAdmin && <span className="text-xs text-red-500 border border-red-500 px-1 rounded ml-1">ADMIN</span>}
                </span>
              </motion.a>

              <div className="flex items-center gap-3 md:gap-6">
                <nav className="hidden md:flex items-center gap-2 bg-background/40 backdrop-blur-md border border-primary/20 rounded-full px-3 py-1.5">
                  {navItems.map((item) => (
                    <motion.a key={item.label} href={item.href} className="px-4 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/15 transition-all">
                      {item.label}
                    </motion.a>
                  ))}
                </nav>

                <div className="hidden md:block h-8 w-[1px] bg-primary/30 rounded-full" />

                <div className="flex items-center gap-2 md:gap-3 relative">
                  <ThemeToggle />

                  {user && (
                    <div className="relative">
                      <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 bg-card/50 md:bg-transparent border md:border-none border-primary/20 rounded-full py-1 px-1.5 md:p-0 cursor-pointer hover:bg-primary/10 transition-all">
                        <span className="font-bold text-xs md:text-sm bg-gradient-to-r from-accent via-primary to-ring bg-clip-text text-transparent max-w-[60px] md:max-w-[100px] truncate pl-1 md:pl-0">
                          {user.user_metadata?.full_name?.split(' ')[0]}
                        </span>
                        <div className={`rounded-full p-[2px] bg-gradient-to-tr ${isAdmin ? 'from-red-500 to-orange-500' : 'from-accent via-primary to-ring'} shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0`}>
                          <img src={user.user_metadata?.avatar_url} alt="Profile" className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover border-2 border-background" />
                        </div>
                      </div>

                      {/* DROPDOWN MENU */}
                      <AnimatePresence>
                        {showProfileMenu && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-48 bg-card border-2 border-primary/20 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] py-2 flex flex-col z-50 overflow-hidden">
                            {!isAdmin ? (
                              <button onClick={handleAdminLogin} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/20 transition-all">
                                <Shield size={16} className="text-primary"/> Mode Admin
                              </button>
                            ) : (
                              <button onClick={handleKeluarAdmin} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-orange-500/20 transition-all">
                                <Shield size={16} className="text-orange-500"/> Keluar Mode Admin
                              </button>
                            )}
                            <div className="h-[1px] bg-primary/20 w-full my-1"></div>
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all">
                              <LogOut size={16} /> Logout
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1 text-foreground shrink-0">
                  {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
              </div>

            </div>
          </div>
        </motion.header>

        {/* ... (Menu HP dan Footer tidak saya ubah, tetep sama) ... */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl fixed top-20 left-0 right-0 z-40">
              <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)} className="text-foreground/80 hover:text-primary font-medium py-2 pl-4 border-l-2 border-transparent hover:border-primary transition-all">{item.label}</a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        <main style={{ paddingTop: `${headerHeight}px` }}>{children}</main>
        <footer className="relative border-t border-primary/20 bg-background/50 backdrop-blur-xl mt-24">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-accent/5 pointer-events-none" />
          <div className="container mx-auto px-4 py-12 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent mb-4">Genztalk.id</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs">Platform tempat Gen Z menyuarakan opini dan diskusi. Suaramu, Panggungmu.</p>
                <div className="flex items-center gap-4">
                  <a href="https://instagram.com/genztalk.id_" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all border border-primary/20"><Instagram size={18} /></a>
                  <a href="mailto:hello@genztalk.id" className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-black transition-all border border-accent/20"><Mail size={18} /></a>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Navigasi</h4>
                <ul className="space-y-3">{navItems.map((item) => (<li key={item.href}><a href={item.href} className="text-muted-foreground hover:text-primary text-sm">{item.label}</a></li>))}</ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Kontak</h4>
                <p className="text-muted-foreground text-sm mb-2">Email: hello@genztalk.id</p>
                <p className="text-muted-foreground text-sm">Indonesia</p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-primary/10 text-center"><p className="text-muted-foreground text-sm">© 2026 Genztalk.id. All rights reserved.</p></div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
