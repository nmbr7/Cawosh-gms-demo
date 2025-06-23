export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);

  if (res.status === 401) {
    // Remove token from cookies (client-side)
    document.cookie = "access_token=; Max-Age=0; path=/";
    // Redirect to login
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return res;
}
