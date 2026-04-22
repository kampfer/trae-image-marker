import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToolType = 'none' | 'horizontal-line' | 'vertical-line' | 'normal-protractor' | 'horizontal-protractor' | 'vertical-protractor';

export type CommandId =
  | 'file-new'
  | 'file-open'
  | 'file-save'
  | 'file-save-as'
  | 'file-add-image'
  | 'file-remove-image'
  | 'file-export-png'
  | 'edit-undo'
  | 'edit-redo'
  | 'edit-clear-all'
  | 'edit-delete-selected'
  | 'tool-horizontal-line'
  | 'tool-vertical-line'
  | 'tool-normal-protractor'
  | 'tool-horizontal-protractor'
  | 'tool-vertical-protractor'
  | 'image-zoom-in'
  | 'image-zoom-out'
  | 'image-fit-window'
  | 'image-actual-size'
  | 'image-rotate'
  | 'image-rotate-counter'
  | 'image-reset-rotation'
  | 'help-dev-tools';

export interface Command {
  id: CommandId;
  label: string;
  shortcut?: string;
  disabled: boolean;
}

interface CommandState {
  activeTool: ToolType;
  executingCommand: CommandId | null;
  commands: Record<CommandId, boolean>;
}

const initialState: CommandState = {
  activeTool: 'none',
  executingCommand: null,
  commands: {
    'file-new': false,
    'file-open': false,
    'file-save': false,
    'file-save-as': false,
    'file-add-image': false,
    'file-remove-image': false,
    'file-export-png': false,
    'edit-undo': false,
    'edit-redo': false,
    'edit-clear-all': false,
    'edit-delete-selected': false,
    'tool-horizontal-line': false,
    'tool-vertical-line': false,
    'tool-normal-protractor': false,
    'tool-horizontal-protractor': false,
    'tool-vertical-protractor': false,
    'image-zoom-in': false,
    'image-zoom-out': false,
    'image-fit-window': false,
    'image-actual-size': false,
    'image-rotate': false,
    'image-rotate-counter': false,
    'image-reset-rotation': false,
    'help-dev-tools': false,
  },
};

const commandSlice = createSlice({
  name: 'command',
  initialState,
  reducers: {
    setActiveTool: (state, action: PayloadAction<ToolType>) => {
      state.activeTool = action.payload;
    },
    resetTool: (state) => {
      state.activeTool = 'none';
    },
    executeCommand: (state, action: PayloadAction<CommandId>) => {
      state.executingCommand = action.payload;
    },
    finishCommand: (state) => {
      state.executingCommand = null;
    },
    setCommandDisabled: (state, action: PayloadAction<{ commandId: CommandId; disabled: boolean }>) => {
      state.commands[action.payload.commandId] = action.payload.disabled;
    },
    setAllCommandsDisabled: (state, action: PayloadAction<boolean>) => {
      const keys = Object.keys(state.commands) as CommandId[];
      keys.forEach(key => {
        state.commands[key] = action.payload;
      });
    },
  },
});

export const {
  setActiveTool,
  resetTool,
  executeCommand,
  finishCommand,
  setCommandDisabled,
  setAllCommandsDisabled,
} = commandSlice.actions;

export default commandSlice.reducer;
