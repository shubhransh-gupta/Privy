const RECENT_KEY = 'localtools-recent'
const FAVORITES_KEY = 'localtools-favorites'
const MAX_RECENT = 10

export function getRecentTools(): string[] {
  try {
    const data = localStorage.getItem(RECENT_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addRecentTool(toolId: string): void {
  const recent = getRecentTools().filter((id) => id !== toolId)
  recent.unshift(toolId)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

export function getFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function toggleFavorite(toolId: string): boolean {
  const favorites = getFavorites()
  const index = favorites.indexOf(toolId)
  if (index >= 0) {
    favorites.splice(index, 1)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    return false
  }
  favorites.push(toolId)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  return true
}

export function isFavorite(toolId: string): boolean {
  return getFavorites().includes(toolId)
}
