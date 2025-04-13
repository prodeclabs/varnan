import {pgTable, serial, text, timestamp, varchar} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	linearId: varchar('linear_id', {length: 255}),
	name: varchar('name', {length: 255}),
	email: varchar('email', {length: 255}).unique(),
	profession: varchar('profession', {length: 255}),
	accessToken: text('access_token'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})
