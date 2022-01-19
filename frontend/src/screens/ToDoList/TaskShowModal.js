import React from "react";
import { useState, useEffect } from "react";
import "./TaskShowModal.css";
import { useSelector, useDispatch } from "react-redux";
import { setShowModalStatus, setTaskTitle } from "../../store/TasksListReducer";
function TaskShowModal() {
	const tasksList = useSelector((state) => state.tasks);
	const task = tasksList.filter((task) => task.showModal == true)[0];

	//Extrage task-ul din baza de date

	const dispatch = useDispatch();

	function toggleTaskModalStatus() {
		dispatch(setShowModalStatus(task.id));
	}

	function setTitle(e) {
		dispatch(setTaskTitle(e.target.value));
	}

	function toggleCompleteHandler(e) {
		task.isCompleted = !task.isCompleted;
	}

	return (
		<div className={`Task-Modal ${!task && "hidden"}`}>
			<div
				onClick={toggleTaskModalStatus}
				className={`Overlay ${!task && "hidden"}`}
			></div>
			<div className={`Modal-Window ${!task && "hiddenModal-Window"}`}>
				{task && (
					<>
						<i
							onClick={toggleTaskModalStatus}
							className="fas fa-times close-Modal"
						/>
						<div className="Modal_Content">
							<input
								placeholder="Enter the title of the task"
								value={task.title}
								onChange={setTitle}
								className="change-title_Modal"
							/>
							<div className="checkbox-container">
								<input
									onChange={toggleCompleteHandler}
									checked={task.isCompleted}
									name="remember_me"
									type="checkbox"
									id="remember-checkbox"
									className="remember-checkbox"
								/>
								<label htmlFor="remember-checkbox" className="remember-label">
									{task.isCompleted ? "Completed" : "To Do"}
								</label>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default TaskShowModal;
