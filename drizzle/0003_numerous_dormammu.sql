CREATE TABLE "project_contexts" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_url" varchar(255),
	"project_context" text,
	"metadata_file_type" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "project_contexts_github_url_unique" UNIQUE("github_url")
);
--> statement-breakpoint
CREATE TABLE "user_project_contexts" (
	"user_id" serial NOT NULL,
	"project_context_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_project_contexts_user_id_project_context_id_pk" PRIMARY KEY("user_id","project_context_id")
);
--> statement-breakpoint
ALTER TABLE "user_project_contexts" ADD CONSTRAINT "user_project_contexts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_project_contexts" ADD CONSTRAINT "user_project_contexts_project_context_id_project_contexts_id_fk" FOREIGN KEY ("project_context_id") REFERENCES "public"."project_contexts"("id") ON DELETE no action ON UPDATE no action;