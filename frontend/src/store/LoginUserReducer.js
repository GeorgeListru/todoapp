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
    changeUserEmail: (state, action) => {
      state.email = action.payload;
      localStorage.setItem("loginData", JSON.stringify(state));
      return state;
    },
  },
});

export const {
  loginUserRemember,
  loginUserForget,
  logoutUser,
  changeUserEmail,
} = loginSlice.actions;

export default loginSlice.reducer;
