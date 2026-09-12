import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shoe } from '../types/shoe';




interface CompareStore {
  compareShoes: Shoe[];
  pendingSync: boolean;
  addShoe: (shoe: Shoe) => boolean;
  removeShoe: (shoeId: string) => void;
  clearAll: () => void;
  setShoes: (shoes: Shoe[]) => void;
  isShoeInCompare: (shoeId: string) => boolean;
  canAddMore: () => boolean;
  setPendingSync: (pending: boolean) => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      compareShoes: [],
      pendingSync: false,

      addShoe: (shoe: Shoe) => {
        const { compareShoes, canAddMore, isShoeInCompare } = get();

        // Check if shoe is already in compare list
        if (isShoeInCompare(shoe.id)) {
          return false;
        }

        // Check if we can add more shoes (max 4)
        if (!canAddMore()) {
          return false;
        }

        set({ compareShoes: [...compareShoes, shoe], pendingSync: true });
        return true;
      },

      removeShoe: (shoeId: string) => {
        set((state) => ({
          compareShoes: state.compareShoes.filter((shoe) => shoe.id !== shoeId),
          pendingSync: true,
        }));
      },

      clearAll: () => {
        set({ compareShoes: [], pendingSync: false });
      },

      setShoes: (shoes: Shoe[]) => {
        set({ compareShoes: shoes, pendingSync: false });
      },

      isShoeInCompare: (shoeId: string) => {
        return get().compareShoes.some((shoe) => shoe.id === shoeId);
      },

      canAddMore: () => {
        return get().compareShoes.length < 4;
      },

      setPendingSync: (pending: boolean) => {
        set({ pendingSync: pending });
      },
    }),
    {
      name: 'compare-shoes-storage', // localStorage key
    }
  )
);
