// Initialize Socket.IO server when the API route is called
export async function initializeSocketServer() {
  try {
    const response = await fetch('/api/socket', {
      method: 'GET',
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('Socket.IO server initialized:', data.message)
      return true
    } else {
      console.error('Failed to initialize Socket.IO server')
      return false
    }
  } catch (error) {
    console.error('Error initializing Socket.IO server:', error)
    return false
  }
}




