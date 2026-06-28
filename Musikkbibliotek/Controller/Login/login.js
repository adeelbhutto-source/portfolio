function login() {
	const { username, password } = model.viewState.login;
	const user = model.data.users.find(
		(u) => u.username === username && u.password === password,
	);

	if (user) {
		model.app.loggedInID = user.id;
		changePage("profile");
	} else {
		alert("Feil brukernavn eller passord");
	}
}