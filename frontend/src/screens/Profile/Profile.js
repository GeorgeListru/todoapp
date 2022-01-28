import React from "react";
import axios from "axios";
import {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import "./Profile.css";
import EditImageModal from "./EditImageModal";
import EditEmailModal from "./EditEmailModal";
import EditPasswordModal from "./EditPasswordModal";
import isEmpty from '../../functions/IsEmpty'
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import ModalErrorMessage from "../../components/ModalErrorMessage/ModalErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

function Profile() {
	const userData = useSelector((state) => state.login);
	const [user, setUser] = useState(null);
	const [avatar, setAvatar] = useState(null);
	const [uploadedImage, setUploadedImage] = useState({});
	const [showEmailEditModal, setShowEmailEditModal] = useState(false);
	const [showPasswordEditModal, setShowPasswordEditModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [showErrorMessage, setShowErrorMessage] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	let showErrorTimeout

	function showErrorModalHandler(message) {
		setErrorMessage(message);
		setShowErrorMessage(true)
		showErrorTimeout = setTimeout(() => {
			setShowErrorMessage(false)
		}, 2500)
	}

	useEffect(() => {
		async function getProfileDataRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			setIsLoading(true)
			try {
				const response = await axios.get("users/profile", config);
				setUser(response.data);
			} catch (e) {
				setUser(null);
			}
			setIsLoading(false)
		}

		async function getProfileAvatarRequest() {

			const config = {
				headers: {
					"Content-Type": "application/json",
					responseType: "arraybuffer",
					Authorization: "Bearer " + userData.token,
				},
			};
			setIsLoading(true)
			try {
				const response = await axios.get("users/avatar", config);
				setAvatar(response.data);
			} catch (e) {
				setAvatar(null);
			}
			setIsLoading(false)
		}

		getProfileDataRequest();
		getProfileAvatarRequest();
	}, []);

	function imageEditHandler(e) {
		const file = e.target.files[0]
		if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg")
			setUploadedImage({file, name: file.name, type: file.type});
		else
			showErrorModalHandler("Only png, jpg, jpeg formats are supported")
	}

	return (
		<div>
			{(isLoading && <LoadingSpinner/>) ||
				<div>
					{
						user ? (
							<div>
								<div className="h1-header">{user.username}</div>

								<div className="avatar-container">
									<img
										src={"data:image/png;base64," + avatar}
										className="avatar"
										alt={"Avatar"}
									/>
									<label htmlFor="upload-avatar" className="upload-avatar-label">
										Upload Image
									</label>
									<input
										onChange={imageEditHandler}
										id="upload-avatar"
										type="file"
										className="upload-avatar"
									/>
								</div>
								<div className="user-profile-data">
									<label>Email: </label>
									<div onClick={() => setShowEmailEditModal(!showEmailEditModal)}>
										{userData.email}
										<i className="far fa-edit"/>
									</div>
								</div>
								<button
									onClick={() => setShowPasswordEditModal(!showPasswordEditModal)}
									className="change-pass-button"
								>
									Change password
								</button>

								<EditImageModal
									filename={!isEmpty(uploadedImage) ? uploadedImage.name : null}
									filetype={!isEmpty(uploadedImage) ? uploadedImage.type : null}
									avatarSetter={setAvatar}
									file={uploadedImage.file}
									fileSetter={setUploadedImage}
								/>
								<EditEmailModal
									showEmailEditSetter={setShowEmailEditModal}
									show={showEmailEditModal}
								/>
								<EditPasswordModal
									showPasswordEditSetter={setShowPasswordEditModal}
									show={showPasswordEditModal}
								/>
								<ModalErrorMessage show={showErrorMessage} text={errorMessage}/>
							</div>
						) : (
							<ErrorMessage>No user found in the database. Try to log in!</ErrorMessage>
						)}
				</div>}
		</div>
	);
}

export default Profile;
