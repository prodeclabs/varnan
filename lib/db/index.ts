import {drizzle} from 'drizzle-orm/neon-http'
import {neon} from '@neondatabase/serverless'

// Create SQL client with Neon
const sql = neon(process.env.DATABASE_URL!)

// Create database instance
export const db = drizzle(sql)
