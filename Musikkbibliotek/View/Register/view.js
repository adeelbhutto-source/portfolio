function registerPage() {
	return /*HTML*/ `
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-title">Registrer deg</div>

            <div class="form-row">
                <label class="form-label">Brukernavn</label>
                <input class="form-input"
                       type="text"
                       placeholder="Brukernavn"
                       oninput="model.viewState.createProfile.username = this.value">
            </div>

            <div class="form-row">
                <label class="form-label">Passord</label>
                <input class="form-input"
                       type="password"
                       placeholder="••••••"
                       oninput="model.viewState.createProfile.password = this.value">
            </div>

            <div class="form-row">
                <label class="form-label">Gjenta passord</label>
                <input class="form-input"
                       type="password"
                       placeholder="••••••"
                       oninput="model.viewState.createProfile.repeatPassword = this.value">
            </div>

            <button class="btn btn-accent btn-full" onclick="register()">Registrer</button>

            <p class="auth-footer">
                Har du konto? <a href="#" onclick="changePage('login')">Logg inn</a>
            </p>
        </div>
    </div>
    `;
}