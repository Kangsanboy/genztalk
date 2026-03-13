import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { IMAGES } from "@/assets/images";
import { Opinion, formatDate, truncateText, getStaggerDelay } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, TrendingUp, Users, Zap, X, Send, Calendar, MapPin, Coffee, Mic, HeartHandshake, MailQuestion, ShieldCheck, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const membershipBenefits = [
  { icon: Zap, title: "Akses Unlimited", description: "Baca dan tulis opini tanpa batas" },
  { icon: Users, title: "Komunitas Eksklusif", description: "Gabung diskusi dengan sesama member" },
  { icon: TrendingUp, title: "Badge Khusus", description: "Dapatkan badge member premium" },
];

const logoPhilosophy = [
  { image: "lingkaran.png", title: "Lingkaran Gradasi", desc: "Melambangkan komunitas yang inklusif dan dinamis. Warna-warninya menggambarkan keberagaman ide, latar belakang, dan perspektif generasi muda.", quote: "Perbedaan perspektif bukan penghalang melainkan awal dari percakapan bermakna." },
  { image: "g.png", title: 'Huruf "G"', desc: "Melambangkan Gen Z sebagai pusat gerakan ini. Bentuknya yang tegas dan dinamis menggambarkan generasi yang kreatif, kritis, dan berani.", quote: "Perubahan yang baik sering dimulai dari generasi yang berani berpikir dan berbicara." },
  { image: "percakapan.png", title: "Balon Percakapan", desc: "Ujung huruf G membentuk balon percakapan. Ini melambangkan dialog, diskusi, dan ruang berbagi gagasan di mana kita saling memahami.", quote: "Percakapan yang baik tidak hanya didengar tetapi juga dipahami." },
  { image: "mic.png", title: "Mikrofon", desc: "Melambangkan suara generasi muda. Simbol dari keberanian untuk berbicara, berbagi cerita, dan menyampaikan perspektif.", quote: "Komunikasi mengubah suara menjadi pemahaman." }
];

// Map Ikon Biar Bisa Disimpen di Database
const iconMap: Record<string, any> = { Mic, Coffee, HeartHandshake, Calendar, MapPin };

export default function Home() {
  const [opinions, setOpinions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // State Jadwal / Events
  const [events, setEvents] = useState<any[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState({ id: '', title: '', date: '', type: '', icon: 'Calendar', desc: '' });

  // State Form Opini & Aduan
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Karir");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [adminFeedbacks, setAdminFeedbacks] = useState<any[]>([]);

  // Modal Komentar
  const [selectedOpinion, setSelectedOpinion] = useState<any>(null);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchOpinions = async () => {
    setLoading(true);
    const { data } = await supabase.from('opinions').select('*, likes(user_email), comments(id)').order('createdat', { ascending: false });
    if (data) {
      const currentUser = (await supabase.auth.getSession()).data.session?.user;
      const formattedData = data.map((item: any) => ({
        ...item,
        author: { username: item.author_username, avatar: item.author_avatar || IMAGES.COMMUNITY_1 },
        createdAt: new Date(item.createdat),
        likesCount: item.likes ? item.likes.length : 0, commentsCount: item.comments ? item.comments.length : 0,
        isLikedByMe: currentUser ? item.likes?.some((l: any) => l.user_email === currentUser.email) : false,
      }));
      setOpinions(formattedData);
    }
    setLoading(false);
  };

  const fetchFeedbacks = async () => {
    const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    if (data) setAdminFeedbacks(data);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: true });
    if (data) setEvents(data);
  };

  useEffect(() => {
    setIsAdmin(localStorage.getItem('admin_mode') === 'true');
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
  }, []);

  useEffect(() => {
    fetchOpinions();
    fetchEvents();
    if (isAdmin) fetchFeedbacks(); 
  }, [user, isAdmin]);

  const handleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google' }); };

  // --- FUNGSI ADMIN UNTUK JADWAL ---
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventFormData.id) {
      // Edit
      await supabase.from('events').update({ title: eventFormData.title, event_date: eventFormData.date, event_type: eventFormData.type, icon_name: eventFormData.icon, description: eventFormData.desc }).eq('id', eventFormData.id);
    } else {
      // Tambah Baru
      await supabase.from('events').insert([{ title: eventFormData.title, event_date: eventFormData.date, event_type: eventFormData.type, icon_name: eventFormData.icon, description: eventFormData.desc }]);
    }
    setShowEventModal(false);
    fetchEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Yakin mau hapus jadwal ini Bang?")) {
      await supabase.from('events').delete().eq('id', id);
      fetchEvents();
    }
  };

  const openEventModal = (event: any = null) => {
    if (event) {
      setEventFormData({ id: event.id, title: event.title, date: event.event_date, type: event.event_type, icon: event.icon_name, desc: event.description });
    } else {
      setEventFormData({ id: '', title: '', date: '', type: '', icon: 'Calendar', desc: '' });
    }
    setShowEventModal(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent || !user) return alert("Login dan isi dulu aduannya Bang!");
    setIsSubmittingFeedback(true);
    const { error } = await supabase.from('feedbacks').insert([{ author_name: user.user_metadata?.full_name || 'Anonim', author_email: user.email, content: feedbackContent }]);
    setIsSubmittingFeedback(false);
    if (!error) {
      alert("Aduan berhasil dikirim!");
      setFeedbackContent("");
      if(isAdmin) fetchFeedbacks();
    }
  };

  const handleSubmitOpinion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent || !user) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('opinions').insert([{ title: newTitle, content: newContent, category: newCategory, author_username: user.user_metadata?.full_name || 'Anonim', author_avatar: user.user_metadata?.avatar_url || IMAGES.COMMUNITY_1 }]);
    setIsSubmitting(false);
    if (!error) { setNewTitle(""); setNewContent(""); setIsWriting(false); fetchOpinions(); }
  };

  const handleLike = async (opinionId: string, isLikedByMe: boolean) => {
    if (!user) return alert("Login dulu Bang buat nge-like!");
    setOpinions(opinions.map(op => {
      if (op.id === opinionId) return { ...op, isLikedByMe: !isLikedByMe, likesCount: isLikedByMe ? op.likesCount - 1 : op.likesCount + 1 };
      return op;
    }));
    if (isLikedByMe) { await supabase.from('likes').delete().match({ opinion_id: opinionId, user_email: user.email }); } 
    else { await supabase.from('likes').insert([{ opinion_id: opinionId, user_email: user.email }]); }
  };

  const openComments = async (opinion: any) => {
    setSelectedOpinion(opinion);
    const { data } = await supabase.from('comments').select('*').eq('opinion_id', opinion.id).order('created_at', { ascending: true });
    setCommentsList(data || []);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !selectedOpinion) return;
    setIsSubmittingComment(true);
    const { error } = await supabase.from('comments').insert([{ opinion_id: selectedOpinion.id, author_username: user.user_metadata?.full_name || 'Anonim', author_avatar: user.user_metadata?.avatar_url || IMAGES.COMMUNITY_1, content: newComment }]);
    setIsSubmittingComment(false);
    if (!error) { setNewComment(""); openComments(selectedOpinion); fetchOpinions(); }
  };

  return (
    <Layout>
      {/* MODAL TAMBAH/EDIT JADWAL KHUSUS ADMIN */}
      <AnimatePresence>
        {showEventModal && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-background border-2 border-primary/30 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_40px_rgba(168,85,247,0.3)] relative">
              <button onClick={() => setShowEventModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"><X size={24} /></button>
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{eventFormData.id ? "Edit Jadwal" : "Tambah Jadwal Baru"}</h3>
              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nama Acara</label>
                  <input type="text" required value={eventFormData.title} onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})} className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Tanggal</label>
                    <input type="text" required placeholder="Contoh: 20 Mar 2026" value={eventFormData.date} onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})} className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Lokasi / Tipe</label>
                    <input type="text" required placeholder="Contoh: Live IG" value={eventFormData.type} onChange={(e) => setEventFormData({...eventFormData, type: e.target.value})} className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Pilih Ikon</label>
                  <select value={eventFormData.icon} onChange={(e) => setEventFormData({...eventFormData, icon: e.target.value})} className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all">
                    <option value="Calendar">Kalender (Default)</option>
                    <option value="Mic">Mikrofon (Podcast)</option>
                    <option value="Coffee">Kopi (Nongkrong)</option>
                    <option value="HeartHandshake">Salaman (Bansos)</option>
                    <option value="MapPin">Pin Lokasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Deskripsi Singkat</label>
                  <textarea required rows={3} value={eventFormData.desc} onChange={(e) => setEventFormData({...eventFormData, desc: e.target.value})} className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all resize-none" />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6">Simpan Jadwal</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- KODE MODAL OPINI DAN KOMENTAR TETAP SAMA --- */}
      <AnimatePresence>
        {isWriting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-background border-2 border-primary/30 rounded-2xl p-6 w-full max-w-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] relative">
              <button onClick={() => setIsWriting(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"><X size={24} /></button>
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Suarakan Opinimu!</h3>
              <form onSubmit={handleSubmitOpinion} className="space-y-4">
                <div><label className="block text-sm font-medium text-muted-foreground mb-1">Judul Opini</label><input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all" /></div>
                <div><label className="block text-sm font-medium text-muted-foreground mb-1">Kategori</label><select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all"><option value="Karir">Karir & Kuliah</option><option value="Mental Health">Mental Health</option><option value="Relationship">Relationship</option><option value="Sosial">Isu Sosial</option></select></div>
                <div><label className="block text-sm font-medium text-muted-foreground mb-1">Isi Opini</label><textarea required rows={6} value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full bg-card/50 border border-primary/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all resize-none" /></div>
                <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-white font-bold">{isSubmitting ? "Mengirim..." : "Kirim Opini"}</Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOpinion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-background border-2 border-primary/30 rounded-2xl w-full max-w-xl shadow-[0_0_40px_rgba(168,85,247,0.3)] relative overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-primary/20 flex justify-between items-center bg-card/50">
                <h3 className="font-bold text-lg text-foreground truncate pr-8">Balasan untuk "{selectedOpinion.title}"</h3><button onClick={() => setSelectedOpinion(null)} className="text-muted-foreground hover:text-primary transition-colors"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {commentsList.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <img src={c.author_avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-primary/20" />
                    <div className="bg-card/40 border border-primary/10 rounded-2xl rounded-tl-none px-4 py-2 flex-1">
                      <div className="flex justify-between items-baseline mb-1"><span className="font-semibold text-sm">{c.author_username}</span><span className="text-xs text-muted-foreground">{formatDate(new Date(c.created_at))}</span></div>
                      <p className="text-sm text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-primary/20 bg-card/50">
                {user ? (
                  <form onSubmit={handleSendComment} className="flex gap-2">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Tulis balasan..." className="flex-1 bg-background border border-primary/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary transition-all" />
                    <Button type="submit" disabled={isSubmittingComment || !newComment.trim()} className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-primary hover:bg-primary/90"><Send size={16} className="text-white ml-[-2px]" /></Button>
                  </form>
                ) : (<p className="text-center text-sm text-primary">Silakan Login untuk berdiskusi.</p>)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0"><img src={IMAGES.NEON_BG_1} alt="BG" className="w-full h-full object-cover opacity-30" /><div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/90" /></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md text-primary font-medium text-sm">Setiap percakapan memiliki makna ✨</motion.div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-ring bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">Suaramu, Panggungmu</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"><strong className="text-foreground">Genztalk.id</strong> adalah ruang percakapan bagi generasi muda Indonesia untuk berbagi gagasan, pengalaman, dan perspektif.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {user ? <Button onClick={() => setIsWriting(true)} size="lg" className="text-lg px-8 py-6 bg-accent text-black font-bold">Tulis Opini Sekarang</Button> : <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-6 bg-primary font-bold text-white">Mulai Bersuara</Button>}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="filosofi" className="py-24 relative bg-background border-t border-primary/10 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Lebih Dari Sekadar Simbol</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {logoPhilosophy.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <Card className="p-8 h-full bg-card/30 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-500 group">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=IMG" }} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="py-24 relative bg-background/30 border-t border-primary/10 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }} className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Agenda <span className="text-primary">Mendatang</span></h2>
            <p className="text-muted-foreground text-lg mb-6">Ikuti kegiatan seru kami secara offline maupun online!</p>
            {isAdmin && (
              <Button onClick={() => openEventModal()} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Plus size={16} className="mr-2"/> Tambah Jadwal
              </Button>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {events.length === 0 ? (
               <p className="text-center col-span-full text-muted-foreground">Belum ada jadwal dalam waktu dekat.</p>
            ) : events.map((event, index) => {
              const EventIcon = iconMap[event.icon_name] || Calendar;
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
                  <Card className="p-6 h-full bg-card/50 border border-primary/20 hover:border-accent/50 transition-colors group relative">
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => openEventModal(event)} className="p-2 bg-background border border-primary/20 rounded-full text-primary hover:bg-primary hover:text-white transition-all"><Edit size={14}/></button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-background border border-red-500/20 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-primary/10">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-black transition-all"><EventIcon size={24} /></div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground pr-16">{event.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><Calendar size={12} /> {event.event_date} • <MapPin size={12} className="ml-1"/> {event.event_type}</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION OPINI */}
      <section id="opinions" className="py-24 relative bg-background/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Ruang Diskusi <span className="text-primary">Gen Z</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (<p className="text-center col-span-full text-primary animate-pulse">Menyiapkan panggung percakapan...</p>) : 
              opinions.map((opinion, i) => (
                <motion.div key={opinion.id} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                  <Card className="h-full backdrop-blur-xl bg-card/40 border-2 border-primary/20 p-6 flex flex-col hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={opinion.author.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1"><p className="font-semibold">{opinion.author.username}</p><p className="text-sm text-muted-foreground">{formatDate(opinion.createdAt)}</p></div>
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">{opinion.category}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{opinion.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-1">{truncateText(opinion.content, 150)}</p>
                    <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                      <button onClick={() => handleLike(opinion.id, opinion.isLikedByMe)} className={`flex items-center gap-2 transition-colors group/btn ${opinion.isLikedByMe ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}><Heart className={`w-5 h-5 transition-all ${opinion.isLikedByMe ? 'fill-red-500' : 'group-hover/btn:fill-red-500/20'}`}/><span className="text-sm font-medium">{opinion.likesCount}</span></button>
                      <button onClick={() => openComments(opinion)} className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group/btn"><MessageCircle className="w-5 h-5 group-hover/btn:text-accent transition-colors"/><span className="text-sm font-medium">{opinion.commentsCount}</span></button>
                    </div>
                  </Card>
                </motion.div>
              ))
            }
          </div>
        </div>
      </section>

      {/* SECTION ADUAN */}
      <section id="aduan" className="py-24 relative border-t border-primary/10 overflow-hidden">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
            <Card className="p-8 md:p-12 bg-card/40 border-2 border-primary/30 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary"><MailQuestion size={24} /></div>
                <div><h3 className="text-2xl font-bold text-foreground">Kotak Suara Pribadi</h3><p className="text-sm text-muted-foreground">Punya keluhan, saran, atau aduan? Sampaikan di sini. 100% Rahasia.</p></div>
              </div>
              <form onSubmit={handleSubmitFeedback}>
                <textarea required rows={4} value={feedbackContent} onChange={(e) => setFeedbackContent(e.target.value)} placeholder={user ? "Ketik pesan rahasiamu ke Admin di sini..." : "Silakan Login dulu buat kirim pesan Bang..."} disabled={!user || isSubmittingFeedback} className="w-full bg-background/50 border border-primary/20 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all resize-none mb-4" />
                <Button type="submit" disabled={!user || isSubmittingFeedback} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6">{isSubmittingFeedback ? "Mengirim..." : "Kirim Pesan ke Admin"}</Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {isAdmin && (
        <section className="py-24 relative bg-red-500/5 border-t border-red-500/20 overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-8"><ShieldCheck size={32} className="text-red-500" /><h2 className="text-3xl font-bold text-foreground">Dapur Admin: Daftar Aduan</h2></div>
              <div className="space-y-4">
                {adminFeedbacks.length === 0 ? (<p className="text-muted-foreground">Belum ada aduan masuk nih, Bang Admin.</p>) : adminFeedbacks.map((fb) => (
                  <Card key={fb.id} className="p-6 bg-card border-l-4 border-l-red-500 shadow-md">
                    <div className="flex justify-between items-start mb-2"><div><p className="font-bold text-foreground">{fb.author_name}</p><p className="text-xs text-muted-foreground">{fb.author_email}</p></div><span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">{formatDate(new Date(fb.created_at))}</span></div>
                    <p className="text-foreground mt-4 p-4 bg-background/50 rounded-lg border border-border">{fb.content}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {!user && (
        <section id="membership" className="py-24 relative overflow-hidden">
           <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-16 bg-gradient-to-r from-ring via-accent to-primary bg-clip-text text-transparent">Bersiaplah Membuka Ruang Baru</h2>
            <Card className="max-w-5xl mx-auto bg-card/40 border-2 border-accent/30 p-8 md:p-12"><Button onClick={handleLogin} size="lg" className="text-lg px-12 py-6 bg-gradient-to-r from-accent to-primary mt-8">Daftar Sekarang</Button></Card>
          </div>
        </section>
      )}
    </Layout>
  );
}
