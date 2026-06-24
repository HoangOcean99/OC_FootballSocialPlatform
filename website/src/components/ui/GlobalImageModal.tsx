'use client';

import { useImageModalStore } from '@/store/useImageModalStore';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GlobalImageModal() {
  const { isOpen, imageUrl, closeModal } = useImageModalStore();
  const [scale, setScale] = useState(1);

  // Reset scale when image changes
  useEffect(() => {
    setScale(1);
  }, [imageUrl]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeModal]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      // Fallback
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <button 
          onClick={handleZoomIn}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Phóng to"
        >
          <ZoomIn className="w-6 h-6" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-6 h-6" />
        </button>
        <button 
          onClick={handleDownload}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Tải xuống"
        >
          <Download className="w-6 h-6" />
        </button>
        <button 
          onClick={closeModal}
          className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors ml-4"
          title="Đóng"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: `scale(${scale})`, transition: 'transform 0.2s ease-out' }}
      >
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-grab active:cursor-grabbing"
          draggable="false"
        />
      </div>
    </div>
  );
}
