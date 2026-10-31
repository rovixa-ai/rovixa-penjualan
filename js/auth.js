// ======================================
// TREEHOUSE POS
// AUTH MODULE
// LOGIN / SESSION USER KASIR
// ======================================

const Auth = {

    SESSION_KEY:
        "TREEHOUSE_POS_SESSION",


    /* ==================================
       LOGIN
    ================================== */

    async login(
        username,
        pin
    ) {

        try {

            const inputUsername =
                String(
                    username || ""
                ).trim();


            const inputPin =
                String(
                    pin || ""
                ).trim();


            if (!inputUsername) {

                throw new Error(
                    "Username belum diisi."
                );

            }


            if (!inputPin) {

                throw new Error(
                    "PIN belum diisi."
                );

            }


            /* ==================================
               LOCAL DB
            ================================== */

            if (
                typeof LocalDB ===
                "undefined"
            ) {

                throw new Error(
                    "LocalDB tidak tersedia."
                );

            }


            const users =
                await LocalDB.getAll(
                    "users"
                );


            if (
                !Array.isArray(users) ||
                !users.length
            ) {

                throw new Error(
                    "Data user belum tersedia di perangkat."
                );

            }


            /* ==================================
               CARI USER
            ================================== */

            const targetUsername =
                inputUsername.toLowerCase();


            const user =
                users.find(
                    item => {

                        return (
                            String(
                                item?.username ||
                                ""
                            )
                            .trim()
                            .toLowerCase() ===
                            targetUsername
                        );

                    }
                );


            if (!user) {

                throw new Error(
                    "Username atau PIN tidak valid."
                );

            }


            /* ==================================
               STATUS USER
            ================================== */

            const status =
                String(
                    user.status ||
                    ""
                )
                .trim()
                .toUpperCase();


            if (
                status !==
                "AKTIF"
            ) {

                throw new Error(
                    "User tidak aktif."
                );

            }


            /* ==================================
               VALIDASI PIN HASH
            ================================== */

            const pinHash =
                String(
                    user.pinHash ||
                    ""
                ).trim();


            if (!pinHash) {

                throw new Error(
                    "PIN user belum dikonfigurasi."
                );

            }


            const inputHash =
                await this.hashPIN(
                    inputPin
                );


            if (
                inputHash !==
                pinHash
            ) {

                throw new Error(
                    "Username atau PIN tidak valid."
                );

            }


            /* ==================================
               SESSION
            ================================== */

            const session = {

                id:
                    String(
                        user.id ||
                        ""
                    ).trim(),

                username:
                    String(
                        user.username ||
                        ""
                    ).trim(),

                nama:
                    String(
                        user.nama ||
                        ""
                    ).trim(),

                role:
                    String(
                        user.role ||
                        ""
                    )
                    .trim()
                    .toUpperCase(),

                loginAt:
                    new Date().toISOString()

            };


            localStorage.setItem(
                this.SESSION_KEY,
                JSON.stringify(
                    session
                )
            );


            


            return {

                success:
                    true,

                user:
                    session

            };

        }
        catch (error) {

            console.error(
                "AUTH LOGIN ERROR:",
                error
            );


            return {

                success:
                    false,

                message:
                    error.message

            };

        }

    },


    /* ==================================
       HASH PIN
    ================================== */

    async hashPIN(
        pin
    ) {

        const value =
            String(
                pin || ""
            );


        if (
            !window.crypto ||
            !window.crypto.subtle
        ) {

            throw new Error(
                "Web Crypto API tidak tersedia."
            );

        }


        const encoder =
            new TextEncoder();


        const data =
            encoder.encode(
                value
            );


        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );


        const hashArray =
            Array.from(
                new Uint8Array(
                    hashBuffer
                )
            );


        return hashArray
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        )
            )
            .join("");

    },


    /* ==================================
       GET SESSION
    ================================== */

    getSession() {

        try {

            const value =
                localStorage.getItem(
                    this.SESSION_KEY
                );


            if (!value) {

                return null;

            }


            const session =
                JSON.parse(
                    value
                );


            if (
                !session ||
                !session.id
            ) {

                return null;

            }


            return session;

        }
        catch (error) {

            console.error(
                "AUTH SESSION ERROR:",
                error
            );


            return null;

        }

    },


    /* ==================================
       IS LOGIN
    ================================== */

    isLoggedIn() {

        return !!this.getSession();

    },


    /* ==================================
       CURRENT USER
    ================================== */

    getCurrentUser() {

        return this.getSession();

    },


    /* ==================================
       LOGOUT
    ================================== */

    logout() {

        localStorage.removeItem(
            this.SESSION_KEY
        );


        
    },


    /* ==================================
       ROLE
    ================================== */

    hasRole(
        role
    ) {

        const session =
            this.getSession();


        if (!session) {

            return false;

        }


        return (
            String(
                session.role ||
                ""
            )
            .trim()
            .toUpperCase() ===
            String(
                role ||
                ""
            )
            .trim()
            .toUpperCase()
        );

    },


    /* ==================================
       SESSION USER VALID
    ================================== */

    async validateSession() {

        const session =
            this.getSession();


        if (!session) {

            return {

                success:
                    false,

                loggedIn:
                    false

            };

        }


        try {

            const user =
                await LocalDB.get(
                    "users",
                    session.id
                );


            if (!user) {

                this.logout();


                return {

                    success:
                        false,

                    loggedIn:
                        false,

                    message:
                        "User tidak ditemukan."

                };

            }


            const status =
                String(
                    user.status ||
                    ""
                )
                .trim()
                .toUpperCase();


            if (
                status !==
                "AKTIF"
            ) {

                this.logout();


                return {

                    success:
                        false,

                    loggedIn:
                        false,

                    message:
                        "User sudah tidak aktif."

                };

            }


            return {

                success:
                    true,

                loggedIn:
                    true,

                user: {

                    id:
                        String(
                            user.id ||
                            ""
                        ).trim(),

                    username:
                        String(
                            user.username ||
                            ""
                        ).trim(),

                    nama:
                        String(
                            user.nama ||
                            ""
                        ).trim(),

                    role:
                        String(
                            user.role ||
                            ""
                        )
                        .trim()
                        .toUpperCase()

                }

            };

        }
        catch (error) {

            console.error(
                "AUTH VALIDATE SESSION ERROR:",
                error
            );


            return {

                success:
                    false,

                loggedIn:
                    false,

                message:
                    error.message

            };

        }

    }

};