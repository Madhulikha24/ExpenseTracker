// use this to decode a token and get the user's information out of it
import decode from 'jwt-decode';

// create a new class to instantiate for a user
class AuthService {
  // get user data
  getProfile() {
    return decode(this.getToken());
  }

  // check if user's logged in
  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token); // handwaiving here
  }

  // check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      // If the token's expiration time (exp) is less than the current time, it's expired
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem('id_token'); // Remove expired token
        // Use a more React-friendly way to redirect if possible,
        // window.location.assign will cause a full page reload.
        // For example, using React Router's history.push if applicable.
        // For this context, keeping it as is, but be aware of its impact.
        window.location.assign('/');
        return true; // Token is expired
      }
      return false; // Token is not expired
    } catch (err) {
      // If there's an error decoding (e.g., malformed token), treat as expired
      console.error("Error decoding token:", err);
      localStorage.removeItem('id_token'); // Clean up potentially bad token
      // window.location.assign('/'); // Redirect on error to ensure clean state
      return true; // Treat as expired if decoding fails
    }
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token');
  }

  login(idToken) {
    // Saves user token to localStorage
    localStorage.setItem('id_token', idToken);
    // As noted above, window.location.assign('/') causes a full reload.
    // Consider using React Router's `history.push('/')` or `navigate('/')`
    // if you have a client-side routing library, for a smoother UX.
    window.location.assign('/');
  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
    // this will reload the page and reset the state of the application
    window.location.assign('/');
  }
}

// Assign the instance to a variable before exporting as module default
const authServiceInstance = new AuthService();
export default authServiceInstance;