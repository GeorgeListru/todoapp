import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./screens/Home/Home";
import Login from "./screens/Login/Login";
import Register from "./screens/Register/Register";
function App() {
	return (
		<Router>
			<div className="App">
				<Header />
				<main>
					<Routes>
						<Route path="/" element={<Home />} exact />
						<Route path="/login" element={<Login />} exact />
						<Route path="/register" element={<Register />} exact />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
