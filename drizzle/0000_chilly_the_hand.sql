CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"linear_id" varchar(255),
	"name" varchar(255),
	"email" varchar(255),
	"access_token" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_linear_id_unique" UNIQUE("linear_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
