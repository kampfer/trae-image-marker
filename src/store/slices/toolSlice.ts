import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToolType = 'none' | 'horizontal-line' | 'vertical-line' | 'normal-protractor' | 'horizontal-protractor' | 'vertical-protractor';

interface ToolState {
  activeTool: ToolType;
}

const initialState: ToolState = {
  activeTool: 'none',
};

const toolSlice = createSlice({
  name: 'tool',
  initialState,
  reducers: {
    setActiveTool: (state, action: PayloadAction<ToolType>) => {
      state.activeTool = action.payload;
    },
    resetTool: (state) => {
      state.activeTool = 'none';
    },
  },
});

export const { setActiveTool, resetTool } = toolSlice.actions;
export default toolSlice.reducer;