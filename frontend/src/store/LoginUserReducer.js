import { createSlice } from "@reduxjs/toolkit";
const getLoginData = JSON.parse(localStorage.getItem("loginData"));
const initialState = getLoginData || {};

export const loginSlice = createSlice({
	name: "login",
	initialState,
	reducers: {
		loginUserRemember: (state, action) => {
			localStorage.setItem("loginData", JSON.stringify(action.payload));
			return action.payload;
		},
		loginUserForget: (state, action) => {
			return action.payload;
		},
		logoutUser: (state) => {
			localStorage.removeItem("loginData");
			return {};
		},
	},
});

export const { loginUserRemember, loginUserForget, logoutUser } =
	loginSlice.actions;

export default loginSlice.reducer;
