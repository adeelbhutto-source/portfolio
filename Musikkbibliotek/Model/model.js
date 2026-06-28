const model = {
    app: {
        app: document.getElementById("app"),
        allPages: [
            'homePage',
            'searchPage',
            'wishList',
            'viewDetails',
            'addDetails',
            'editDetails',
            'profile',
            'login',
            'register',
        ],

        currentPage: 'homePage',
        mobileMenuToggle: false,
        loggedInID: null,
    },

    viewState: {
        editMusicInfo: {
            genre: null,
            location: null,
        },

        musicInfo: {
            id: null,
            title: '',
            artist: '',
            location: [],
            releaseYear: null,
            genre: [],
            notes: '',
            wishlist: false,
            coverImg: null,
        },

        login: {
            username: '',
            password: '',
        },

        createProfile: {
            username: '',
            password: '',
            repeatPassword: '',
        },

        searchBar: null,
    },

    data: {
        genre: ['Rock', 'Jazz', 'Country', '90-talls pop'],
        location: ['Stue', 'Loft'],

        musicInfo: [
            {
                id: 1,
                title: 'Sang tittel',
                artist: 'Artist',
                location: [0],
                releaseYear: 1996,
                genre: [1],
                notes: 'Notat her',
                wishlist: false,
                coverImg: null,
            },
            {
                id: 2,
                title: 'Album tittel',
                artist: 'Artist',
                location: [1],
                releaseYear: 1991,
                genre: [3],
                notes: 'Notaten',
                wishlist: false,
                coverImg: null,
            },
            {
                id: 3,
                title: 'EP tittel',
                artist: 'Artist',
                location: [1],
                releaseYear: 1991,
                genre: [3],
                notes: 'Notaten',
                wishlist: false,
                coverImg: null,
            },
        ],

        users: [
            {
                id: 1,
                username: 'demo_user',
                password: 'demo_password',
            },
            {
                id: 2,
                username: 'demo_user2',
                password: 'demo_password',
            },
        ]

    },
}