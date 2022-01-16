import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./LoginUserReducer";
export const store = configureStore({
	reducer: {
		login: loginReducer,
	},
});
