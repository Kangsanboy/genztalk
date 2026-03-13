import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { IMAGES } from "@/assets/images";
import { Opinion, formatDate, truncateText, getStaggerDelay } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, TrendingUp, Users, Zap } from "lucide-react";
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

  // Fungsi buat narik data dari database Supabase
  useEffect(() => {
    async function fetchOpinions() {
      const { data, error } = await supabase
        .from('opinions')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error("Waduh, gagal narik data:", error);
      }

      if (data) {
        // Kita sesuaikan datanya biar cocok sama desain web kamu
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
          createdAt: new Date(item.createdAt),
        }));
        
        setOpinions(formattedData);
      }
      setLoading(false);
    }
    fetchOpinions();
  }, []);

  // Fungsi buat Login with Google
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    <Layout>
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.NEON_BG_1}
            alt="Neon Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              Suaramu, Panggungmu
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Platform tempat Gen Z Indonesia menyuarakan opini, berbagi ide, dan
              membangun diskusi yang bermakna
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Button
                onClick={handleLogin}
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_40px_rgba(168,85,247,0.8)] transition-all duration-300"
              >
                Mulai Bersuara
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="opinions" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent via-primary to-ring bg-clip-text text-transparent">
              Opini Terbaru
            </h2>
            <p className="text-xl text-muted-foreground">
              Lihat apa yang lagi hot di komunitas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-center col-span-full text-primary animate-pulse">Memuat opini keren dari database...</p>
            ) : opinions.length === 0 ? (
              <p className="text-center col-span-full text-muted-foreground">Belum ada opini. Jadilah yang pertama bersuara!</p>
            ) : (
              opinions.map((opinion, index) => (
                <motion.div
                  key={opinion.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.6,
                    delay: getStaggerDelay(index, 0.1),
                    ease: "easeOut",
                  }}
                >
                  <Card className="h-full backdrop-blur-xl bg-card/40 border-2 border-primary/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-primary/40 transition-all duration-300 overflow-hidden group">
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={opinion.author.avatar}
                          alt={opinion.author.username}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/50"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {opinion.author.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(opinion.createdAt)}
                          </p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                          {opinion.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                        {opinion.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">
                        {truncateText(opinion.content, 150)}
                      </p>

                      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group/btn">
                          <Heart className="w-5 h-5 group-hover/btn:fill-primary group-hover/btn:text-primary transition-all" />
                          <span className="text-sm font-medium">
                            {opinion.likes}
                          </span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group/btn">
                          <MessageCircle className="w-5 h-5 group-hover/btn:text-accent transition-colors" />
                          <span className="text-sm font-medium">
                            {opinion.comments}
                          </span>
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary/50 hover:bg-primary/10 hover:border-primary shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300"
            >
              Lihat Semua Opini
            </Button>
          </motion.div>
        </div>
      </section>

      <section id="membership" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-ring via-accent to-primary bg-clip-text text-transparent">
              Join the Riot
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Jadi bagian dari komunitas Gen Z yang paling berpengaruh di
              Indonesia
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="backdrop-blur-xl bg-card/40 border-2 border-accent/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {membershipBenefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: getStaggerDelay(index, 0.15),
                        }}
                        className="text-center"
                      >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-accent/50 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                          <benefit.icon className="w-8 h-8 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {benefit.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center"
                  >
                    <div className="mb-6">
                      <p className="text-4xl font-bold text-foreground mb-2">
                        Gratis
                      </p>
                      <p className="text-muted-foreground">
                        Untuk early adopters
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <Button
                        onClick={handleLogin}
                        size="lg"
                        className="text-lg px-12 py-6 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(34,211,238,0.7)] transition-all duration-300"
                      >
                        Daftar Sekarang
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
