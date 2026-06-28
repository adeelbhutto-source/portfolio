function loginPage() {
	return /*HTML*/ `
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-title">Logg inn</div>

            <div class="form-row">
                <label class="form-label">Brukernavn</label>
                <input class="form-input"
                       type="text"
                       placeholder="Brukernavn"
                       oninput="model.viewState.login.username = this.value">
            </div>

            <div class="form-row">
                <label class="form-label">Passord</label>
                <input class="form-input"
                       type="password"
                       placeholder="••••••"
                       oninput="model.viewState.login.password = this.value">
            </div>

            <button class="btn btn-accent btn-full" onclick="login()">Logg inn</button>

            <p class="auth-footer">
                Ingen konto? <a href="#" onclick="changePage('register')">Registrer deg</a>
            </p>
        </div>
    </div>
    `;
}