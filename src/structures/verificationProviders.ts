let verificationProviders = {
    Bloxlink: {
        URL: "api.blox.link/v1",
        endpoints: {
            getUser: "/user/"
        }
    },
    Rowifi: {
        URL: "api.rowifi.link/v1",
        endpoints: {
            getUser: "/users/"
        }
    },
    Rover: {
        URL: "verify.eryn.io/api",
        endpoints: {
            getUser: "/user/"
        }
    }
}

export default verificationProviders;
