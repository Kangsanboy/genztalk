import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { IMAGES } from "@/assets/images";
import { Opinion, formatDate, truncateText, getStaggerDelay } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, TrendingUp, Users, Zap, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const membershipBenefits = [
  { icon: Zap, title: "Akses Unlimited", description: "Baca dan tulis opini tanpa batas" },
  { icon: Users, title: "Komunitas Eksklusif", description: "Gabung diskusi dengan sesama member" },
  { icon: TrendingUp, title: "Badge Khusus", description: "Dapatkan badge member premium" },
];

// DATA GAMBAR LOGO (Siap pakai file gambar asli)
const logoPhilosophy = [
  {
    image: "/filosofi-1.png", // <--- Nanti taruh gambar aslinya di folder public dengan nama ini
    title: "Lingkaran Gradasi",
    desc: "Melambangkan komunitas yang inklusif dan dinamis. Warna-warninya menggambarkan keberagaman ide, latar belakang, dan perspektif generasi muda.",
    quote: "Perbedaan perspektif bukan penghalang melainkan awal dari percakapan bermakna."
  },
  {
    image: "/filosofi-2.png", 
    title: 'Huruf "G"',
    desc: "Melambangkan Gen Z sebagai pusat gerakan ini. Bentuknya yang tegas dan dinamis menggambarkan generasi yang kreatif, kritis, dan berani.",
    quote: "Perubahan yang baik sering dimulai dari generasi yang berani berpikir dan berbicara."
  },
  {
    image: "/filosofi-3.png", 
    title: "Balon Percakapan",
    desc: "Ujung huruf G membentuk balon percakapan. Ini melambangkan dialog, diskusi, dan ruang berbagi gagasan di mana kita saling memahami.",
    quote: "Percakapan yang baik tidak hanya didengar tetapi juga dipahami."
  },
  {
    image: "/filosofi-4.png", 
    title: "Mikrofon",
    desc: "Melambangkan suara generasi muda. Simbol dari keberanian untuk berbicara, berbagi cerita, dan menyampaikan perspektif.",
    quote: "Komunikasi mengubah suara menjadi pemahaman."
  }
];

export default function Home() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // State buat Kotak Form Opini
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Karir");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi narik data dipisah biar bisa dipanggil ulang setelah ngirim opini
  const fetchOpinions = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchOpinions();
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  // FUNGSI NGIRIM OPINI KE DATABASE
  const handleSubmitOpinion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase.from('opinions').insert([
      {
        title: newTitle,
        content: newContent,
        category: newCategory,
        author_username: user?.user_metadata?.full_name || 'Anonim',
        author_avatar: user?.user_metadata?.avatar_url || IMAGES.COMMUNITY_1,
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      alert("Gagal ngirim opini nih Bang! Coba lagi ya.");
      console.error(error);
    } else {
      // Bersihin form dan tutup popup
      setNewTitle("");
      setNewContent("");
      setIsWriting(false);
      // Tarik ulang data biar opini barunya langsung nongol!
      fetchOpinions();
    }
  };

  return (
    <Layout>
      {/* KOTAK POP-UP FORM TULIS OPINI */}
      <AnimatePresence>
        {isWriting && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-background border-2 border-primary/30 rounded-2xl p-6 w-full max-w-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] relative"
            >
              <button 
                onClick={() => setIsWriting(false)} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Suarakan Opinimu!
              </h3>
              
              <form onSubmit={handleSubmitOpinion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Judul Opini</label>
                  <input 
                    type="text" required
                    value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Contoh: Kenapa Gen Z Gampang Burnout?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Kategori</label>
                  <select 
                    value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Karir">Karir & Kuliah</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Relationship">Relationship</option>
                    <option value="Keuangan">Keuangan</option>
                    <option value="Sosial">Isu Sosial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Isi Opini</label>
                  <textarea 
                    required rows={6}
                    value={newContent} onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    placeholder="Tumpahkan semua isi pikiranmu di sini..."
                  />
                </div>

                <Button 
                  type="submit" disabled={isSubmitting}
                  className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-white font-bold"
                >
                  {isSubmitting ? "Mengirim ke Angkasa..." : "Kirim Opini"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION HERO */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={IMAGES.NEON_BG_1} alt="Neon Background" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/90" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md text-primary font-medium text-sm">
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
                <Button onClick={() => setIsWriting(true)} size="lg" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 shadow-[0_0_30px_rgba(34,211,238,0.6)] text-black font-bold">
                  Tulis Opini Sekarang
                </Button>
              ) : (
                <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                  Mulai Bersuara
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION MAKNA LOGO & IDENTITAS */}
      <section id="filosofi" className="py-24 relative bg-background border-t border-primary/10">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Lebih Dari Sekadar Simbol
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {logoPhilosophy.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card className="p-8 h-full bg-card/30 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-500 group relative overflow-hidden">
                  
                  {/* TEMPAT GAMBAR ASLI ABANG */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=IMG" }} // Gambar cadangan kalau file belum ada
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
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

      {/* SECTION OPINI */}
      <section id="opinions" className="py-24 relative bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Ruang Diskusi <span className="text-primary">Gen Z</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-center col-span-full text-primary animate-pulse">Menyiapkan panggung percakapan...</p>
            ) : opinions.length === 0 ? (
              <p className="text-center col-span-full text-muted-foreground">Belum ada opini. Beranikan dirimu untuk mulai bersuara!</p>
            ) : (
              opinions.map((opinion) => (
                <Card key={opinion.id} className="h-full backdrop-blur-xl bg-card/40 border-2 border-primary/20 p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={opinion.author.avatar} alt={opinion.author.username} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{opinion.author.username}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(opinion.createdAt)}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">{opinion.category}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{opinion.title}</h3>
                  <p className="text-muted-foreground mb-4 flex-1">{truncateText(opinion.content, 150)}</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <button className="flex items-center gap-2 text-muted-foreground"><Heart className="w-5 h-5"/><span>{opinion.likes}</span></button>
                    <button className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="w-5 h-5"/><span>{opinion.comments}</span></button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION MEMBERSHIP */}
      {!user && (
        <section id="membership" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-16 bg-gradient-to-r from-ring via-accent to-primary bg-clip-text text-transparent">Bersiaplah Membuka Ruang Baru</h2>
            <Card className="max-w-5xl mx-auto bg-card/40 border-2 border-accent/30 p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {membershipBenefits.map((benefit, i) => (
                  <div key={i} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/50 mb-4">
                      <benefit.icon className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                ))}
              </div>
              <Button onClick={handleLogin} size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-accent to-primary">Daftar Sekarang</Button>
            </Card>
          </div>
        </section>
      )}
    </Layout>
  );
}
