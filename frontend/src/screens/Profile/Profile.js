import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Buffer } from "buffer";
import "./Profile.css";
function Profile() {
	const userData = useSelector((state) => state.login);
	const [user, setUser] = useState(null);
	const [avatar, setAvatar] = useState(null);
	useEffect(() => {
		async function getProfileDataRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + userData.token,
				},
			};
			const response = await axios.get("users/profile", config);
			if (response.request.status === 200) {
				setUser(response.data);
			}
		}
		async function getProfileAvatarRequest() {
			const config = {
				headers: {
					"Content-Type": "application/json",
					responseType: "arraybuffer",
					Authorization: "Bearer " + userData.token,
				},
			};
			const response = await axios.get("users/avatar", config);
			if (response.request.status === 200) {
				setAvatar(response.data);
			}
		}

		getProfileDataRequest();
		getProfileAvatarRequest();
	}, []);
	useEffect(() => {}, []);

	return (
		<div>
			{user ? (
				<div>
					<div className="h1-header">{user.username}</div>
					<div className="avatar-container">
						<img src={"data:image/png;base64," + avatar} />
						<label htmlFor="upload-avatar">Upload Image</label>
						<input
							id="upload-avatar"
							type="file"
							className="upload-avatar"
						></input>
					</div>
				</div>
			) : (
				<></>
			)}
		</div>
	);
}

export default Profile;
