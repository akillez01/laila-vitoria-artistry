import { Instagram } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../data/photographyData';
import { api } from '../lib/api';
import { InstagramPost } from '../types';

export const InstagramSection: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ posts: InstagramPost[] }>('/api/instagram').catch(() => ({ posts: [] })),
      api<{ instagramWidgetUrl: string }>('/api/site-settings').catch(() => ({ instagramWidgetUrl: '' })),
    ]).then(([{ posts }, { instagramWidgetUrl }]) => {
      setPosts(posts);
      setWidgetUrl(instagramWidgetUrl || null);
      setLoaded(true);
    });
  }, []);

  if (!loaded || (!widgetUrl && posts.length === 0)) return null;

  // Feed ao vivo (widget de terceiro, ex: SnapWidget) — mostra os posts reais automaticamente.
  if (widgetUrl) {
    return (
      <section
        className="bg-white dark:bg-[#181a1d] border-t border-neutral-200 dark:border-neutral-800 py-16 transition-colors duration-300"
        id="instagram"
        data-motion="reveal"
      >
        <div className="max-w-2xl mx-auto px-5 sm:px-8 md:px-16">
          <div className="flex flex-col items-center text-center gap-4 mb-6">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-bold">
              Direto do Instagram
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 dark:text-white font-bold tracking-tight">
              {INSTAGRAM_HANDLE}
            </h2>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all"
            >
              <Instagram className="w-4 h-4" /> Seguir no Instagram
            </a>
          </div>

          <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <iframe
              src={widgetUrl}
              className="w-full border-0"
              height="400"
              title="Feed do Instagram"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-white dark:bg-[#181a1d] border-t border-neutral-200 dark:border-neutral-800 py-16 transition-colors duration-300"
      id="instagram"
      data-motion="reveal"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-bold block mb-1">
              Direto do Instagram
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 dark:text-white font-bold tracking-tight">
              {INSTAGRAM_HANDLE}
            </h2>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-neutral-800 dark:hover:bg-amber-400 transition-all shrink-0 self-start"
          >
            <Instagram className="w-4 h-4" /> Seguir no Instagram
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink || INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="group relative shrink-0 w-40 sm:w-auto aspect-square rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 snap-start"
              data-motion="mask"
            >
              {post.mediaType === 'video' ? (
                <video
                  src={post.mediaUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={post.mediaUrl}
                  alt={post.caption || 'Post do Instagram'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                {post.caption && (
                  <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
