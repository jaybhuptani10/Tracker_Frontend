import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myTasks: [],
  partnerTasks: [],
  partner: null,
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.myTasks = action.payload.myTasks || [];
      state.partnerTasks = action.payload.partnerTasks || [];
      state.partner = action.payload.partner || null;
    },
    addTask: (state, action) => {
      state.myTasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.myTasks.findIndex(
        (task) => task._id === action.payload._id
      );
      if (index !== -1) {
        state.myTasks[index] = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setTasks, addTask, updateTask, setLoading, setError } =
  taskSlice.actions;
export default taskSlice.reducer;
