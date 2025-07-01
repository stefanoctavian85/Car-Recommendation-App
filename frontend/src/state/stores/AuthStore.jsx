import { SERVER } from "../../config/global";

class AuthStore {
    constructor() {
        this.isAuthenticated = false;
        this.token = '';
        this.user = '';
    }

    async checkAuthStatus() {
        const token = JSON.parse(localStorage.getItem("token"));
        this.token = token;

        if (!token) {
            this.isAuthenticated = false;
            this.token = '';
            this.user = '';
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
            this.user = '';
            return;
        }

        this.isAuthenticated = true;
        this.token = token;
        await this.getUserData(payload.id);
    }

    async getUserData(userId) {
        try {
            const response = await fetch(`${SERVER}/api/users/${userId}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong!');
            }

            const data = await response.json();
            this.user = data.user;
        } catch (err) {
            this.user = '';
            console.error(err);
        }
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

    setUser(user) {
        this.user = user;
    }

    getUser() {
        return this.user;
    }

    login(token, user) {
        localStorage.setItem("token", JSON.stringify(token));
        this.isAuthenticated = true;
        this.token = token;
        this.user = user;
    }

    logout() {
        localStorage.removeItem("token");
        this.isAuthenticated = false;
        this.token = '';
        this.user = '';
    }
}

export default AuthStore;