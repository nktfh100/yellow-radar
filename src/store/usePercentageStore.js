import create from 'zustand'

const usePercentageStore = create((set) => ({
    percentage: 0,
    shownPercentage: 0,
    setPercentage: (value) => set((state) => ({ percentage: value })),
    setShownPercentage: (value) => set((state) => ({ shownPercentage: value })),
}))

export default usePercentageStore;