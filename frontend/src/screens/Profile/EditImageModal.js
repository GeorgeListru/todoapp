import React from "react";
import {useState, useEffect} from "react";
import "./EditImageModal.css";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import axios from "axios";
import Cropper from "react-cropper";
import {useSelector} from "react-redux";
import "cropperjs/dist/cropper.min.css";

function EditImageModal({filetype, filename, avatarSetter, file, fileSetter}) {
	const userData = useSelector((state) => state.login);
	const [showModal, setShowModal] = useState("hidden");
	const [editingAvatar, setEditingAvatar] = useState(null);
	const image = React.createRef();
	const [croppingData, setCroppingData] = useState({});
	const [saveStatus, setSaveStatus] = useState("");
	useEffect(() => {
		if (file) {
			setShowModal(!file ? "hidden" : "");
			convertTo64String();
		}
		return () => {
		};
	}, [file]);

	function closeWindow() {
		setSaveStatus("")
		setShowModal("hidden");
		fileSetter({});
	}

	function convertTo64String() {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setEditingAvatar(reader.result);
		};
	}

	function onCrop(e) {
		setCroppingData({
			cropX: e.detail.x,
			cropY: e.detail.y,
			cropWidth: e.detail.width,
			cropHeight: e.detail.height,
		});
	}

	function SaveImageDataHandler() {
		async function SaveImageDataRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			console.log(filetype)
			const body = {
				filetype,
				filename,
				image: editingAvatar,
				...croppingData,
			};
			try {
				const response = await axios.post("users/saveavatar", body, config);
				avatarSetter(response.data);
				closeWindow();
				setSaveStatus('Avatar uploaded successfully')
			} catch (e) {
				setSaveStatus('Failed to upload tour avatar')
			}
		}

		SaveImageDataRequest();
	}

	return (
		<div className={"EditImageModal " + showModal}>
			<div onClick={closeWindow} className={"Overlay " + showModal}/>
			<div
				className={
					"EditImageWindow " +
					(showModal.length !== 0 ? "Modal-Window-Hidden" : "")
				}
			>
				<i onClick={closeWindow} className="fas fa-times close-Modal"/>
				<div className="Image-Cropper-Container">
					<Cropper
						src={editingAvatar}
						style={{maxWidth: "25rem", margin: "0 auto"}}
						aspectRatio={1 / 1}
						guides={false}
						crop={onCrop}
						ref={image}
						zoomable={false}
						center={true}
					/>
				</div>
				<button className="save-avatar-button" onClick={SaveImageDataHandler}>
					Save avatar
				</button>
				<div className="Modal-ChangesLoading">
					<i>{saveStatus}</i>
				</div>
			</div>
		</div>
	);
}

export default EditImageModal;
