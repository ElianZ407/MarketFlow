/**
 * Authentication Logic
 */

const Auth = {
    login(email, password) {
        const users = DB.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem(DB.KEYS.SESSION, JSON.stringify(user));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem(DB.KEYS.SESSION);
        window.location.href = 'index.html';
    },

    getUser() {
        const session = localStorage.getItem(DB.KEYS.SESSION);
        return session ? JSON.parse(session) : null;
    },

    checkAuth() {
        if (!this.getUser()) {
            window.location.href = 'index.html';
        }
    }
};
