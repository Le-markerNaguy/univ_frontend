export async function checkAuth() {
  try {
    const response = await fetch("https://univ-backend-ynxx.onrender.com/api/auth/me", {
      method: "GET",
      credentials: "include",
    })

    if (response.ok) {
      const data = await response.json()
      console.log("[v0] Données reçues de /me:", data)
      return data // Retourne directement { user: ... }
    }
    return null
  } catch (error) {
    console.error("Erreur lors de la vérification d'authentification:", error)
    return null
  }
}

export async function logout() {
  try {
    const response = await fetch("https://univ-backend-ynxx.onrender.com/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })

    if (response.ok) {
      window.location.href = "/"
    }
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error)
  }
}
