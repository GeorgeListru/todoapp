import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { store } from "./store/store";
import { Provider } from "react-redux";
import Header from "./components/Header/Header";
import Home from "./screens/Home/Home";
import Login from "./screens/Login/Login";
import Register from "./screens/Register/Register";
import ToDoList from "./screens/ToDoList/ToDoList";
import Profile from "./screens/Profile/Profile";
function App() {
	return (
		<Router>
			<div className="App">
				<Provider store={store}>
					<Header />
					<main>
						<Routes>
							<Route path="/" element={<Home />} exact />
							<Route path="/login" element={<Login />} exact />
							<Route path="/register" element={<Register />} exact />
							<Route path="/todolist" element={<ToDoList />} exact />
							<Route path="/profile" element={<Profile />} exact />
						</Routes>
					</main>
				</Provider>
			</div>
		</Router>
	);
}

export default App;
