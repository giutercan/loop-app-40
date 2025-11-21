CREATE TABLE "analytics_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"ticket_number" text NOT NULL,
	"reviewer" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"comments" text,
	"responsible_ai_checklist" jsonb
);
--> statement-breakpoint
CREATE TABLE "responsible_ai_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"ai_feature_used" text NOT NULL,
	"human_in_loop" boolean DEFAULT true NOT NULL,
	"transparency_score" integer NOT NULL,
	"data_provenance_complete" boolean DEFAULT false NOT NULL,
	"bias_assessment_complete" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "baselines" ALTER COLUMN "exposure" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "financial_projections" ALTER COLUMN "incremental_cash_flow" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "financial_projections" ALTER COLUMN "cumulative" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "financial_projections" ALTER COLUMN "npv" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "kpi_readings" ALTER COLUMN "value" SET DATA TYPE numeric(20, 6);--> statement-breakpoint
ALTER TABLE "value_hypotheses" ALTER COLUMN "exposure" SET DATA TYPE numeric(20, 4);--> statement-breakpoint
ALTER TABLE "baselines" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "baselines" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "company_data_points" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "financial_projections" ADD COLUMN "discount_rate" numeric(10, 6) NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_projections" ADD COLUMN "confidence" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_projections" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "interventions" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "kpi_readings" ADD COLUMN "confidence" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "kpi_readings" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "kpis" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "value_hypotheses" ADD COLUMN "confidence" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "value_hypotheses" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "analytics_reviews" ADD CONSTRAINT "analytics_reviews_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsible_ai_checklists" ADD CONSTRAINT "responsible_ai_checklists_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;