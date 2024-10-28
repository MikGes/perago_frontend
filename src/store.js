// stores/positionStore.js
import { create } from 'zustand';

const usePositionStore = create((set) => ({
  positions: [],
  positionByPagination: [],
  fetchPositions: async () => {
    try {
      const response = await fetch("http://localhost:5005/position/hierarchy");
      const data = await response.json();
      set({ positions: data });
    } catch (error) {
      console.error("Failed to fetch positions", error);
    }
  },
  fetchPaginationPositions: async (page, pageSize) => {
    try {
      const response = await fetch(`http://localhost:5005/position/get-by-pagination?page=${page + 1}&pageSize=${pageSize}`);
      const data = await response.json();
      set({
        positionByPagination: data.positions, // Adjust to match your data structure
        total: data.total // Save total count if needed for pagination
      });
    } catch (error) {
      console.error("Failed to fetch paginated positions", error);
    }
  }

  // updatePosition: async (positionId, updatedData) => {
  //     try {
  //         const response = await fetch(`http://localhost:5005/position/update-position/${positionId}`, {
  //             method: "PATCH",
  //             headers: {
  //                 "Content-Type": "application/json"
  //             },
  //             body: JSON.stringify(updatedData)
  //         });
  //         const result = await response.json();
  //         if (result.done) {
  //             await usePositionStore.getState().fetchPositions(); // Refresh positions after update
  //         }
  //         return result;
  //     } catch (error) {
  //         console.error("Failed to update position", error);
  //         return { done: false };
  //     }
  // }
}));

export default usePositionStore;
