import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./LoginUserReducer";
import tasksReducer from "./TasksListReducer";
export const store = configureStore({
	reducer: {
		login: loginReducer,
		tasks: tasksReducer,
	},
});
