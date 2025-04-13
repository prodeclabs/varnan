import {clsx, type ClassValue} from 'clsx'
import {twMerge} from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

/**
 * Generates a random string of specified length
 * Used for OAuth state parameter to prevent CSRF attacks
 */
export const generateRandomString = (length: number): string => {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let text = ''

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}

	return text
}
