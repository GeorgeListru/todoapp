import React from "react";
import {useState, useEffect} from "react";
import axios from "axios";
import "./ToDoList.css";
import {Row, Col} from "react-bootstrap";
import {useSelector, useDispatch} from "react-redux";
import ToDoTask from "./ToDoTask";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import TaskShowModal from "./TaskShowModal";
import {setTasks} from "../../store/TasksListReducer";
import FormatDate from "../../functions/FormatDate";
import ModalErrorMessage from "../../components/ModalErrorMessage/ModalErrorMessage"
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

function ToDoList() {
	const userData = useSelector((state) => state.login);
	const tasksList = useSelector((state) => state.tasks);
	const [errorMessage, setErrorMessage] = useState("");
	const [showErrorMessage, setShowErrorMessage] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	let showErrorTimeout

	const dispatch = useDispatch();

	function formatTaskData(task) {
		task.createdAt = FormatDate(task.createdAt);
		task = {
			...task,
			showDeleteBtn: false,
			changingStatus: false,
			showModal: false,
		};
		return task;
	}

	function showErrorModalHandler(message) {
		setErrorMessage(message);
		setShowErrorMessage(true)
		showErrorTimeout = setTimeout(() => {
			setShowErrorMessage(false)
		}, 2500)
	}

	useEffect(() => {
		async function GetToDoListRequest() {
			setIsLoading(true);
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			try {
				const response = await axios.get("todolist/getlist", config);
				let tasks = response.data;
				for (let i = 0; i < tasks.length; i++) {
					tasks[i] = formatTaskData(tasks[i]);
				}
				dispatch(setTasks(tasks));
			} catch (e) {
				if (e.response) showErrorModalHandler(e.response.data.detail)
			}
			setIsLoading(false);
		}

		GetToDoListRequest();
	}, []);

	const [enterItemMode, setEnterItemMode] = useState(false);

	function enterItemHandler(e) {
		setEnterItemMode(true);
	}

	const [enteredTitle, setEnteredTitle] = useState("");

	function addItemHandler() {
		async function AddItemToDoListRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const body = {
				title: enteredTitle,
			};
			try {
				const response = await axios.post("todolist/additem", body, config);
				setEnterItemMode(false);
				const task = formatTaskData(response.data);
				dispatch(setTasks([task, ...tasksList]));
				setEnteredTitle("");
			} catch (e) {
				if (e.response) showErrorModalHandler(e.response.data.detail)
			}

		}

		AddItemToDoListRequest();
	}

	const [tab, setTab] = useState("todo");

	function changeTabHandler() {
		if (tab === "todo") setTab("completed");
		else setTab("todo");
	}

	return (
		<div>
			<div className="h1-header">TO DO LIST</div>
			<TaskShowModal/>
			<div className="todolist-tabs">
				<div
					className={`tabline ${
						tab === "completed" ? "tabline-down" : "tabline-up"
					}`}
				/>
				<div
					onClick={changeTabHandler}
					className={`todolist-tab-page ${
						tab === "todo" ? "todolist-tabs-current-page" : ""
					}`}
				>
					To Do
				</div>
				<div
					onClick={changeTabHandler}
					className={`todolist-tab-page ${
						tab === "completed" ? "todolist-tabs-current-page" : ""
					}`}
				>
					Completed
				</div>
			</div>
			<div className="todolist">
				{(isLoading && <LoadingSpinner/>) || ((tasksList.length === 0 &&
						<ErrorMessage>There are no saved tasks. Create some!</ErrorMessage>)) ||
					tasksList.map((task) => {
						if (tab === "todo" && !task.isCompleted) {
							return <ToDoTask key={task.id} task={task}/>;
						} else if (tab === "completed" && task.isCompleted) {
							return <ToDoTask key={task.id} task={task}/>;
						}
					})}
			</div>
			<div
				className={`add-to-do-item-button ${
					enterItemMode ? "enter-item-box" : ""
				}`}
				onClick={enterItemHandler}
			>
				{enterItemMode ? (
					<Row className="row-fullwidth">
						<Col md={10} className="col">
							<input
								placeholder="Enter your task"
								autocomplete="off"
								name="entered-task"
								className="enter-task-input"
								value={enteredTitle}
								onChange={(e) => setEnteredTitle(e.target.value)}
								maxLength="48"
								minLength="4"
								autoFocus
								onKeyDown={(e) => {
									(e.key === "Enter" && addItemHandler()) || (e.key === "Escape" && setEnterItemMode(false));
								}}
							/>
						</Col>
						<Col md={2} className="col add-item-button" onClick={addItemHandler}>
							<i className="fas fa-arrow-up add-to-list-icon"/>
						</Col>
					</Row>
				) : (
					<i className="fas fa-plus add-todo-item-icon"/>
				)}
			</div>
			<ModalErrorMessage show={showErrorMessage} text={errorMessage}/>
		</div>
	);
}

export default ToDoList;
