import { create } from 'zustand';

interface ImageModalState {
  imageUrl: string | null;
  isOpen: boolean;
  openModal: (url: string) => void;
  closeModal: () => void;
}

export const useImageModalStore = create<ImageModalState>((set) => ({
  imageUrl: null,
  isOpen: false,
  openModal: (url) => set({ imageUrl: url, isOpen: true }),
  closeModal: () => set({ imageUrl: null, isOpen: false }),
}));
