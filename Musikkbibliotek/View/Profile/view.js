function profilePage() {
	const albums = model.data.musicInfo;

	const gridHTML = albums
		.map((album) => {
			const albumCover = album.coverImg
				? `<img src="${album.coverImg}" alt="Cover">`
				: "🎵";
			return /*HTML*/ `
        <div class="profile-album-card" onclick="viewMusicDetails(${album.id})">
            <div class="profile-album-img">${albumCover}</div>
            <div class="profile-album-info">
                <div class="profile-album-title">${album.title}</div>
                <div class="profile-album-artist">${album.artist}</div>
            </div>
        </div>
        `;
		})
		.join("");

	return /*HTML*/ `
    <div class="page-header">
        <span class="page-title">Min profil</span>
    </div>
    ${
			albums.length
				? `<div class="profile-grid">${gridHTML}</div>`
				: `<div class="empty-state"><div class="empty-state-icon">🎵</div>Ingen album i biblioteket ennå.</div>`
		}
    `;
}
