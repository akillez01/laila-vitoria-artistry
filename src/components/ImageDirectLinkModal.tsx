import React, { useState } from 'react';
import { Link as LinkIcon, Check, Copy, ExternalLink, X } from 'lucide-react';

interface ImageDirectLinkModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const ImageDirectLinkModal: React.FC<ImageDirectLinkModalProps> = ({ url, title, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white max-w-xl w-full rounded-md shadow-2xl border border-[#c4c7c7] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f9f9f9] border-b border-[#e2e2e2] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-[#1a1c1c]" />
            <h3 className="font-playfair text-lg text-[#1a1c1c] font-medium">Link Direto da Imagem</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5e5e5e] hover:text-black p-1 rounded hover:bg-[#eeeeee] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Image Thumbnail Preview */}
          <div className="aspect-[16/9] w-full bg-[#1c1b1b] rounded overflow-hidden relative group border border-[#c4c7c7]">
            <img src={url} alt={title} className="w-full h-full object-contain" />
            <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded backdrop-blur-xs font-mono">
              Alta Resolução HQ
            </div>
          </div>

          <h4 className="font-playfair text-base text-[#1a1c1c]">{title}</h4>

          {/* Direct URL Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#747878] block">
              URL Direta da Imagem (Link Público)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full bg-[#f3f3f4] border border-[#c6c6c7] text-xs font-mono text-[#1a1c1c] p-2.5 rounded focus:outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(url)}
                className="bg-[#000000] text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#2f3131] transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#eeeeee]">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#000000] hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Imagem em Nova Aba</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5e5e5e] hover:text-black"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
