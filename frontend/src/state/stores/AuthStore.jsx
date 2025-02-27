class AuthStore {
    constructor() {
        this.isAuthenticated = false;
        this.token = '';
    }

    checkAuthStatus() {
        const token = JSON.parse(localStorage.getItem("token"));
        this.token = token;

        if (!token) {
            this.isAuthenticated = false;
            this.token = '';
            return;
        }

        const arrayToken = token.split('.');
        const payload = JSON.parse(atob(arrayToken[1]));
        const currentTime = Math.floor(new Date().getTime() / 1000);
        const expirationTime = payload.exp;
        
        if (expirationTime < currentTime) {
            localStorage.removeItem("token");
            this.isAuthenticated = false;
            this.token = '';
            return;
        }

        this.isAuthenticated = true;
        this.token = token;
    }

    setIsAuthenticated(isAuthenticated) {
        this.isAuthenticated = isAuthenticated;
    }

    getAuthStatus() {
        return this.isAuthenticated;
    }

    setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    login(token) {
        localStorage.setItem("token", JSON.stringify(token));
        this.isAuthenticated = true;
        this.token = token;
    }

    logout() {
        localStorage.removeItem("token");
        this.setIsAuthenticated = false;
        this.setToken('');
    }
}

export default AuthStore;