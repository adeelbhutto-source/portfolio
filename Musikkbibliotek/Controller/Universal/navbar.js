function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');

    // Selve togglen
    model.app.mobileMenuToggle = !model.app.mobileMenuToggle;

    //forkortelse
    const mobileMenu = model.app.mobileMenuToggle;

    if (mobileMenu == true) {
        menu.classList.toggle('open');
        console.log(mobileMenu)
        console.log("On")
    } else {
        menu.classList.remove('open');
        console.log(mobileMenu)
        console.log("Off")
    }
}

// function navbar() {
//     return /*HTML*/ `
//         <button onclick="changePage('homePage')">Hjem</button>
//         <button onclick="changePage('wishList')">Ønskeliste</button>

//         <input id="navSearchInput" placeholder="Søkefelt" oninput="model.viewState.searchBar = this.value">
//         <button onclick="changePage('searchPage')">Søk</button>

//         <button onclick="changePage('login')">Logg inn</button>
//         <button onclick="changePage('profile')">Profil</button>
//         `;
// }