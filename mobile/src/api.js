export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export function getMobileToken() {
	return localStorage.getItem('mobile_token')
}

export async function api(path, { method = 'GET', body, isForm = false } = {}) {
	const headers = { 'ngrok-skip-browser-warning': '1' }
	const token = getMobileToken()
	if (token) headers.Authorization = `Bearer ${token}`
	if (!isForm) headers['Content-Type'] = 'application/json'

	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers,
		body: isForm ? body : body ? JSON.stringify(body) : undefined,
	})

	const text = await res.text()
	if (!res.ok) {
		let detail = text || 'Request failed'
		try {
			const parsed = JSON.parse(text)
			detail = parsed.detail || detail
		} catch {}
		const err = new Error(detail)
		err.status = res.status
		throw err
	}

	if (!text) return {}
	return JSON.parse(text)
}
