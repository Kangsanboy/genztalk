import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { IMAGES } from "@/assets/images";
import { Opinion, formatDate, truncateText, getStaggerDelay } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, TrendingUp, Users, Zap, LogOut, CircleDashed, Type, MessageSquare, Mic } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const membershipBenefits = [
  { icon: Zap, title: "Akses Unlimited", description: "Baca dan tulis opini tanpa batas" },
  { icon: Users, title: "Komunitas Eksklusif", description: "Gabung diskusi dengan sesama member" },
  { icon: TrendingUp, title: "Badge Khusus", description: "Dapatkan badge member premium" },
];

// Data filosofi logo dari gambar Instagram Abang
const logoPhilosophy = [
  {
    icon: CircleDashed,
    title: "Lingkaran Gradasi",
    desc: "Melambangkan komunitas yang inklusif dan dinamis. Warna-warninya menggambarkan keberagaman ide, latar belakang, dan perspektif generasi muda.",
    quote: "Perbedaan perspektif bukan penghalang melainkan awal dari percakapan bermakna."
  },
  {
    icon: Type,
    title: 'Huruf "G"',
    desc: "Melambangkan Gen Z sebagai pusat gerakan ini. Bentuknya yang tegas dan dinamis menggambarkan generasi yang kreatif, kritis, dan berani.",
    quote: "Perubahan yang baik sering dimulai dari generasi yang berani berpikir dan berbicara."
  },
  {
    icon: MessageSquare,
    title: "Balon Percakapan",
    desc: "Ujung huruf G membentuk balon percakapan. Ini melambangkan dialog, diskusi, dan ruang berbagi gagasan di mana kita saling memahami.",
    quote: "Percakapan yang baik tidak hanya didengar tetapi juga dipahami."
  },
  {
    icon: Mic,
    title: "Mikrofon",
    desc: "Melambangkan suara generasi muda. Simbol dari keberanian untuk berbicara, berbagi cerita, dan menyampaikan perspektif.",
    quote: "Komunikasi mengubah suara menjadi pemahaman."
  }
];

export default function Home() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

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

  return (
    <Layout>
      {/* SECTION HERO (Diperbarui dengan Copywriting Baru) */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.NEON_BG_1} alt="Neon Background" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/90" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md text-primary font-medium text-sm"
            >
              Setiap percakapan memiliki makna ✨
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              Suaramu, Panggungmu
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              <strong className="text-foreground">Genztalk.id</strong> adalah ruang percakapan bagi generasi muda Indonesia untuk berbagi gagasan, pengalaman, dan perspektif. Tempat di mana Gen Z berbicara, didengar, dan saling memahami.
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
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

      {/* SECTION BARU: MAKNA LOGO & IDENTITAS */}
      <section id="filosofi" className="py-24 relative bg-background border-t border-primary/10">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Lebih Dari Sekadar Simbol
            </h2>
            <p className="text-lg text-muted-foreground">
              Di dalamnya ada makna tentang suara, percakapan, dan keberagaman perspektif yang saling bertemu. Karena kami percaya, pemahaman dapat membawa perubahan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {logoPhilosophy.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-8 h-full bg-card/30 backdrop-blur-sm border border-primary/20 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-[100px] -z-10 transition-all duration-500 group-hover:scale-110" />
                  
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 border border-primary/30 group-hover:border-primary transition-colors">
                    <item.icon className="w-7 h-7 text-accent" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{item.desc}</p>
                  
                  <div className="mt-auto pt-6 border-t border-border/50">
                    <p className="text-sm font-medium italic text-accent/80">"{item.quote}"</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION OPINI (Supabase) */}
      <section id="opinions" className="py-24 relative bg-background/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Ruang Diskusi <span className="text-primary">Gen Z</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Selama kita tetap terbuka untuk mendengar dan memahami, setiap percakapan akan membawa kita pada pemahaman yang lebih dalam.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-center col-span-full text-primary animate-pulse">Menyiapkan panggung percakapan...</p>
            ) : opinions.length === 0 ? (
              <p className="text-center col-span-full text-muted-foreground">Belum ada opini. Beranikan dirimu untuk mulai bersuara!</p>
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

      {/* SECTION MEMBERSHIP (Dihilangkan kalau udah login) */}
      {!user && (
        <section id="membership" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-ring via-accent to-primary bg-clip-text text-transparent">
                Bersiaplah Membuka Ruang Baru
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
