import {pgTable, serial, text, timestamp, varchar, primaryKey} from 'drizzle-orm/pg-core'

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

export const projectContexts = pgTable('project_contexts', {
	id: serial('id').primaryKey(),
	githubUrl: varchar('github_url', {length: 255}).unique(),
	projectContext: text('project_context'),
	metadataFileType: varchar('metadata_file_type', {length: 50}),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const userProjectContexts = pgTable('user_project_contexts', {
	userId: serial('user_id').notNull().references(() => users.id),
	projectContextId: serial('project_context_id').notNull().references(() => projectContexts.id),
	createdAt: timestamp('created_at').defaultNow()
}, (table) => {
	return {
		pk: primaryKey({columns: [table.userId, table.projectContextId]})
	}
})
