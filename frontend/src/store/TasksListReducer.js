import { createSlice } from "@reduxjs/toolkit";
const initialState = [];
export const tasksSlice = createSlice({
	name: "tasksList",
	initialState,
	reducers: {
		setTasks: (state, action) => {
			return action.payload;
		},
		deleteTask: (state, action) => {
			const id = action.payload;
			const filteredList = state.filter((task) => task.id != id);
			return filteredList;
		},
		setChangingStatus: (state, action) => {
			const { id, status } = action.payload;
			for (let i = 0; i < state.length; i++) {
				if (id === state[i].id) {
					state[i].changingStatus = status;
				}
			}
		},
		setIsCompletedStatus: (state, action) => {
			const id = action.payload;
			for (let i = 0; i < state.length; i++) {
				if (id === state[i].id) {
					state[i].isCompleted = !state[i].isCompleted;
				}
			}
		},
		setShowDeleteButtonStatus: (state, action) => {
			const { id, status } = action.payload;
			for (let i = 0; i < state.length; i++) {
				if (id === state[i].id) {
					state[i].showDeleteBtn = status;
				}
			}
		},
		setShowModalStatus: (state, action) => {
			const id = action.payload;
			for (let i = 0; i < state.length; i++) {
				if (id === state[i].id) {
					state[i].showModal = !state[i].showModal;
				}
			}
		},
		setTaskTitle: (state, action) => {
			const { id, title } = action.payload;
			for (let i = 0; i < state.length; i++) {
				if (id === state[i].id) {
					state[i].title = title;
				}
			}
		},
	},
});

export const {
	setTasks,
	setChangingStatus,
	setIsCompletedStatus,
	setShowDeleteButtonStatus,
	deleteTask,
	setShowModalStatus,
	setTaskTitle,
} = tasksSlice.actions;

export default tasksSlice.reducer;
