function register() {
	const { username, password, repeatPassword } = model.viewState.createProfile;

	if (!username || !password) {
		alert("Fyll ut alle felt");
		return;
	}

	if (password !== repeatPassword) {
		alert("Passordene er ikke like");
		return;
	}

	if (model.data.users.some((u) => u.username === username)) {
		alert("Brukernavnet finnes allerede");
		return;
	}

	const newId = model.data.users.length + 1;
	model.data.users.push({ id: newId, username, password });
	model.app.loggedInID = newId;
	changePage("profile");
}