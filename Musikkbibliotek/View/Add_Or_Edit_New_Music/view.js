function addDetailsPage() {
    emptyList()
    return buildMusicForm(false)
}


function editDetailsPage() {

    return buildMusicForm(true);
}


function buildMusicForm(isEdit) {
    const info = model.viewState.musicInfo;

    const locationCheckboxes = model.data.location
        .map(
            (loc, i) => /*HTML*/ `
        <label class="checkbox-option">
            <input type="radio"¨
            name="location"
                   ${info.location.includes(i) ? "checked" : ""}
                   onchange="toggleLocationCheckbox(this, ${i})">
            ${loc}
        </label>
    `,
        )
        .join("");

    const genreBoxes = model.data.genre
        .map(
            (loc, i) => /*HTML*/ `
        <label class="checkbox-option">
            <input type="checkbox"¨
            name="genre"
                   ${info.genre.includes(i) ? "checked" : ""}
                   onchange="toggleGenreCheckbox(this, ${i})">
            ${loc}
        </label>
    `,
        )
        .join("");

    const albumCover = info.coverImg
        ? /*HTML*/ `<img src="${info.coverImg}" alt="Cover" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`
        : /*HTML*/ `<span class="form-cover-icon">🎵</span><span>Endre cover</span>`;

    return /*HTML*/ `
    <div class="page-header">
        <span class="page-title">${isEdit ? "Rediger album" : "Legg til album"}</span>
    </div>

    <div class="form-card">
        <div class="form-top">
            <div class="form-cover-slot" title="Endre coverbilde">
            <input type="file"
                accept="image/*"
                    onchange="saveImage(this)">
            ${albumCover}

            </div>

            <div class="form-fields">
                <div class="form-row">
                    <label class="form-label">Artist</label>
                    <input class="form-input"
                           type="text"
                           placeholder="Artistnavn"
                           value="${info.artist}"
                           oninput="model.viewState.musicInfo.artist = this.value">
                </div>
                <div class="form-row">
                    <label class="form-label">Album / Singel / EP</label>
                    <input class="form-input"
                           type="text"
                           placeholder="Tittel"
                           value="${info.title}"
                           oninput="model.viewState.musicInfo.title = this.value">
                </div>
            </div>
        </div>

        <div class="form-row">
            <label class="form-label">Lokasjon</label>
            <div class="checkbox-group">
                ${locationCheckboxes}
            </div>
        </div>

        <div class="form-row">
            <label class="form-label">Årstall</label>
            <input class="form-input"
                   type="number"
                   placeholder="f.eks. 1997"
                   value="${info.releaseYear || ""}"
                   oninput="model.viewState.musicInfo.releaseYear = parseInt(this.value) || null"
                   style="max-width: 140px">
        </div>

        <div class="form-row">
            <label class="form-label">Sjanger</label>
            <div class="checkbox-group">
                ${genreBoxes}
            </div>
        </div>

        <div class="form-row">
            <label class="form-label">Notater</label>
            <textarea class="form-textarea"
                      placeholder="Egne notater om albumet…"
                      oninput="model.viewState.musicInfo.notes = this.value">${info.notes}</textarea>
        </div>

        <label class="checkbox-row">
            <input type="checkbox"
                   ${info.wishlist ? "checked" : ""}
                   onchange="model.viewState.musicInfo.wishlist = this.checked">
            Ønskeliste
        </label>

        <hr class="form-divider">

        <div class="form-actions">
            <div class="form-actions-left">
                <button class="btn btn-accent" onclick="submitChanges(${isEdit})">Lagre</button>
            </div>
            <div class="form-actions-right">
                ${isEdit ? /*HTML*/ `<button class="btn btn-danger" onclick="deleteAlbum(model.viewState.musicInfo.id)">Slett</button>` : ""}
                <button class="btn btn-ghost" onclick="changePage('homePage')">Avbryt</button>
            </div>
        </div>
    </div>
    `;
}
