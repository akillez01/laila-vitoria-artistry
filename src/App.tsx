import { useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { AdminLogin } from './components/AdminLogin';
import { AlbumsView } from './components/AlbumsView';
import { ClientAccessSection } from './components/ClientAccessSection';
import { ClientGalleryModal } from './components/ClientGalleryModal';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import { GeminiChatDrawer } from './components/GeminiChatDrawer';
import { Hero } from './components/Hero';
import { ImageDirectLinkModal } from './components/ImageDirectLinkModal';
import { InstagramSection } from './components/InstagramSection';
import { Navbar } from './components/Navbar';
import { PortfolioGallery } from './components/PortfolioGallery';
import { PricingSection } from './components/PricingSection';
import { ProfileAdminView } from './components/ProfileAdminView';
import { api } from './lib/api';
import { AdminProfile, ClientGallery } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'portfolio' | 'profile' | 'album'>('portfolio');
  const [activeClientGallery, setActiveClientGallery] = useState<ClientGallery | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [activeImageModal, setActiveImageModal] = useState<{ url: string; title: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('lv-theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    window.localStorage.setItem('lv-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    api<{ profile: AdminProfile }>('/api/auth/me')
      .then(({ profile }) => setAdminProfile(profile))
      .catch(() => setAdminProfile(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // Retorno do checkout do Mercado Pago (?pagamento=sucesso|pendente|falha&pedido=ID):
  // reabre a galeria do cliente direto na tela de status/pagamento do pedido.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pedido = params.get('pedido');
    if (!params.get('pagamento') || !pedido) return;

    window.history.replaceState(null, '', window.location.pathname);

    api<{ order: { galleryCode?: string } }>(`/api/orders/${pedido}`)
      .then(({ order }) => {
        if (!order.galleryCode) return;
        return api<{ gallery: ClientGallery }>(`/api/galleries/${encodeURIComponent(order.galleryCode)}`).then(
          ({ gallery }) => {
            setActiveClientGallery(gallery);
            setPendingOrderId(Number(pedido));
          }
        );
      })
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => { });
    setAdminProfile(null);
    setCurrentView('portfolio');
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const handleOpenImageModal = (url: string, title: string) => {
    setActiveImageModal({ url, title });
  };

  return (
    <div className="site-shell min-h-screen flex flex-col bg-[#f9f9f9] dark:bg-[#0f1012] text-[#1a1c1c] dark:text-white selection:bg-[#e5e2e1] selection:text-[#1c1b1b] transition-colors duration-300">
      {/* Navbar (visible on both portfolio and profile views) */}
      <Navbar
        currentView={currentView}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onNavigate={(view) => setCurrentView(view)}
        onOpenChat={() => setChatOpen(true)}
        onOpenContact={() => setContactOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* Main View Switching */}
      {currentView === 'portfolio' ? (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            onExplore={() => scrollToSection('portfolio')}
            onOpenImageModal={handleOpenImageModal}
          />

          {/* Portfolio Grid Section */}
          <PortfolioGallery onOpenImageModal={handleOpenImageModal} />

          {/* About Section */}
          <AboutSection
            onOpenImageModal={handleOpenImageModal}
            onOpenContact={() => setContactOpen(true)}
          />

          {/* Instagram Feed (grade curada pelo admin) */}
          <InstagramSection />

          {/* Pricing / Pacotes & Checkout */}
          <PricingSection />

          {/* Client Access Section */}
          <ClientAccessSection
            onUnlockGallery={(gallery) => setActiveClientGallery(gallery)}
          />
        </main>
      ) : currentView === 'profile' ? (
        /* Screen 2: Perfil / Settings Admin View (protegido por login) */
        !authChecked ? (
          <div className="min-h-[70vh] flex items-center justify-center text-neutral-500 text-sm">
            Verificando sessão...
          </div>
        ) : adminProfile ? (
          <ProfileAdminView
            profile={adminProfile}
            onProfileChange={setAdminProfile}
            onBack={() => setCurrentView('portfolio')}
            onLogout={handleLogout}
            onOpenImageModal={handleOpenImageModal}
          />
        ) : (
          <AdminLogin
            onSuccess={(profile) => setAdminProfile(profile)}
            onBack={() => setCurrentView('portfolio')}
          />
        )
      ) : (
        /* Screen 3: Albums Historical View */
        <AlbumsView onBack={() => setCurrentView('portfolio')} />
      )}

      {/* Footer */}
      <Footer
        onNavigate={(view) => setCurrentView(view)}
        onOpenContact={() => setContactOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* Modals & Drawers */}
      {activeClientGallery && (
        <ClientGalleryModal
          gallery={activeClientGallery}
          onClose={() => {
            setActiveClientGallery(null);
            setPendingOrderId(null);
          }}
          onOpenImageModal={handleOpenImageModal}
          initialOrderId={pendingOrderId}
        />
      )}

      {activeImageModal && (
        <ImageDirectLinkModal
          url={activeImageModal.url}
          title={activeImageModal.title}
          onClose={() => setActiveImageModal(null)}
        />
      )}

      <GeminiChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}
