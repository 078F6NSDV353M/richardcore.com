let tokenClient = null;
let accessToken = null;

/**
 * Initialize Google OAuth client
 * @param {string} clientId
 */
export function initAuth(clientId) {
  if (!window.google || !window.google.accounts) {
    console.error("Google Identity Services not loaded");
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error("Auth error:", tokenResponse);
        return;
      }

      accessToken = tokenResponse.access_token;
      sessionStorage.setItem("access_token", accessToken);
      updateAuthUI();
    },
  });

  const savedToken = sessionStorage.getItem("access_token");
  if (savedToken) {
    accessToken = savedToken;
    updateAuthUI();
  }
}

/**
 * Trigger Google sign-in flow
 */
export function signIn() {
  if (!tokenClient) {
    console.error("Auth not initialized");
    return;
  }

  tokenClient.requestAccessToken();
}

/**
 * Get current access token
 * @returns {string|null}
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Update auth button state
 */
function updateAuthUI() {
  const btn = document.querySelector("[data-auth]");
  if (!btn) return;

  btn.textContent = accessToken ? "Connected" : "Sign In";
}