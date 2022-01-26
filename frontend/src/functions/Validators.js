export function ValidateEmail(email){
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
}

export function ValidatePassword(password){
	return password.length > 7 && /\d/.test(password) && /[a-zA-Z]/g.test(password);
}

export function ValidateUsername(username){
	return !/\s/g.test(username) && !/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(username) && username.length >= 4;
}