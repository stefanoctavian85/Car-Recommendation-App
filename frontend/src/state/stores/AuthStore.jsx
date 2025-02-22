class AuthStore {
    constructor() {
        this.isAuthenticated = false;
    }

    checkAuthStatus() {
        const token = JSON.parse(localStorage.getItem("token"));

        if (!token) {
            this.isAuthenticated = false;
            return;
        }

        const arrayToken = token.split('.');
        const payload = JSON.parse(atob(arrayToken[1]));
        const currentTime = Math.floor(new Date().getTime() / 1000);
        const expirationTime = payload.exp;
        
        if (expirationTime < currentTime) {
            localStorage.removeItem("token");
            this.isAuthenticated = false;
            return;
        }

        this.isAuthenticated = true;
    }

    login(token) {
        localStorage.setItem("token", JSON.stringify(token));
        this.isAuthenticated = true;
    }

    logout() {
        localStorage.removeItem("token");
        this.isAuthenticated = false;
    }
}

export default AuthStore;