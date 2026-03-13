import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { IMAGES } from "@/assets/images";
import { Opinion, formatDate, truncateText, getStaggerDelay } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, TrendingUp, Users, Zap, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const membershipBenefits = [
  {
    icon: Zap,
    title: "Akses Unlimited",
    description: "Baca dan tulis opini tanpa batas",
  },
  {
    icon: Users,
    title: "Komunitas Eksklusif",
    description: "Gabung diskusi dengan sesama member",
  },
  {
    icon: TrendingUp,
    title: "Badge Khusus",
    description: "Dapatkan badge member premium",
  },
];

export default function Home() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // State buat nyimpen data user yang login

  useEffect(() => {
    // 1. Cek apakah ada user yang lagi login saat web dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Pantau kalau-kalau usernya login atau logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 3. Tarik data opini dari database
    async function fetchOpinions() {
      const { data, error } = await supabase
        .from('opinions')
        .select('*')
        .order('createdat', { ascending: false });

      if (error) console.error("Waduh, gagal narik data:", error);

      if (data) {
        const formattedData = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          author: {
            id: item.id,
            username: item.author_username,
            avatar: item.author_avatar || IMAGES.COMMUNITY_1,
            joinedAt: new Date(), 
          },
          category: item.category,
          likes: item.likes,
          comments: item.comments,
          createdAt: new Date(item.createdat),
        }));
        setOpinions(formattedData);
      }
      setLoading(false);
    }
    
    fetchOpinions();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Layout>

      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.NEON_BG_1} alt="Neon Background" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              Suaramu, Panggungmu
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Platform tempat Gen Z Indonesia menyuarakan opini, berbagi ide, dan membangun diskusi yang bermakna
            </p>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
              {/* TOMBOL BERUBAH KALAU UDAH LOGIN */}
              {user ? (
                <Button size="lg" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:shadow-[0_0_40px_rgba(34,211,238,0.8)] transition-all duration-300 text-black font-bold">
                  Tulis Opini Sekarang
                </Button>
              ) : (
                <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_40px_rgba(168,85,247,0.8)] transition-all duration-300">
                  Mulai Bersuara
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="opinions" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent via-primary to-ring bg-clip-text text-transparent">
              Opini Terbaru
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-center col-span-full text-primary animate-pulse">Memuat opini keren dari database...</p>
            ) : opinions.length === 0 ? (
              <p className="text-center col-span-full text-muted-foreground">Belum ada opini. Jadilah yang pertama bersuara!</p>
            ) : (
              opinions.map((opinion, index) => (
                <motion.div key={opinion.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: getStaggerDelay(index, 0.1), ease: "easeOut" }}>
                  <Card className="h-full backdrop-blur-xl bg-card/40 border-2 border-primary/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-primary/40 transition-all duration-300 group">
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <img src={opinion.author.avatar} alt={opinion.author.username} className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/50" />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{opinion.author.username}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(opinion.createdAt)}</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">{opinion.category}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{opinion.title}</h3>
                      <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">{truncateText(opinion.content, 150)}</p>
                      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group/btn">
                          <Heart className="w-5 h-5 group-hover/btn:fill-primary group-hover/btn:text-primary transition-all" />
                          <span className="text-sm font-medium">{opinion.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group/btn">
                          <MessageCircle className="w-5 h-5 group-hover/btn:text-accent transition-colors" />
                          <span className="text-sm font-medium">{opinion.comments}</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION MEMBERSHIP DIHILANGKAN KALAU UDAH LOGIN */}
      {!user && (
        <section id="membership" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-ring via-accent to-primary bg-clip-text text-transparent">
                Join the Riot
              </h2>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <Card className="backdrop-blur-xl bg-card/40 border-2 border-accent/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] p-8 md:p-12 text-center">
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  {membershipBenefits.map((benefit, index) => (
                    <div key={index} className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/50 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <benefit.icon className="w-8 h-8 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={handleLogin} size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-accent to-primary shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                  Daftar Sekarang
                </Button>
              </Card>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
