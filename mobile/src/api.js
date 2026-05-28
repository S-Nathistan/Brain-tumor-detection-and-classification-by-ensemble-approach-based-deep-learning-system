const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function getMobileToken() {
	return localStorage.getItem('mobile_token')
}

export async function api(path, { method = 'GET', body, isForm = false } = {}) {
	const headers = {}
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
		throw new Error(detail)
	}

	if (!text) return {}
	return JSON.parse(text)
}
