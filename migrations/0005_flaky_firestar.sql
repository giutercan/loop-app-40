CREATE TABLE "account_issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'issue' NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"solution_area" text,
	"korn_ferry_pillar" text,
	"estimated_value" integer,
	"linked_initiative_ids" integer[],
	"owner" text,
	"due_date" timestamp,
	"resolved_at" timestamp,
	"source_insight_ids" integer[],
	"provenance" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account_user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text,
	"role" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"sector" text,
	"tier" text,
	"company_logo_url" text,
	"website" text,
	"strategy_notes" text,
	"okr_summary" text,
	"fiscal_year_start" text,
	"account_owner" text,
	"client_sponsor" text,
	"relationship_start_date" timestamp,
	"contract_start_date" timestamp,
	"contract_end_date" timestamp,
	"annual_contract_value" text,
	"primary_contact_name" text,
	"primary_contact_email" text,
	"health_score" integer,
	"last_qbr_date" timestamp,
	"next_qbr_date" timestamp,
	"total_value_promised" integer,
	"total_value_realized" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_guidance_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"pack_id" integer,
	"target_persona" text NOT NULL,
	"guidance_type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"trigger_event" text NOT NULL,
	"trigger_details" jsonb,
	"suggested_actions" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"viewed_at" timestamp,
	"acted_on_at" timestamp,
	"dismissed_at" timestamp,
	"dismiss_reason" text,
	"snoozed_until" timestamp,
	"ai_model" text,
	"ai_confidence" integer,
	"ai_reasoning" text,
	"was_helpful" boolean,
	"helpfulness_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tool_calls" jsonb,
	"tool_name" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"account_id" integer,
	"project_id" integer,
	"context_type" text DEFAULT 'global' NOT NULL,
	"context_snapshot" jsonb,
	"title" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "alignment_share_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"share_token" text NOT NULL,
	"customer_name" text,
	"customer_email" text,
	"permissions" text DEFAULT 'edit' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp,
	"portal_sections" jsonb,
	"welcome_message" text,
	"portal_title" text,
	"client_comments" jsonb,
	"client_approvals" jsonb,
	CONSTRAINT "alignment_share_links_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "behavioural_condition_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ai_suggested_conditions" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blue_sheets" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"data" jsonb NOT NULL,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_model" text,
	"ai_generated_at" timestamp,
	"source_context" jsonb,
	"last_edited_by" text,
	"last_edited_at" timestamp,
	"edit_history" jsonb,
	"section_completion" jsonb,
	"last_exported_at" timestamp,
	"export_format" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyer_journeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"persona_id" integer,
	"journey_context" text DEFAULT 'pre_solution',
	"phases" jsonb,
	"solution_unblocks" jsonb,
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyer_personas" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"persona_name" text,
	"persona_title" text,
	"persona_company" text,
	"facts" jsonb,
	"goals" jsonb,
	"pains" jsonb,
	"behaviours" jsonb,
	"ai_generated" boolean DEFAULT false,
	"ai_provenance" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitive_intelligence" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"solution_area" text NOT NULL,
	"competitor_id" text NOT NULL,
	"competitor_name" text NOT NULL,
	"contextual_positioning" text NOT NULL,
	"client_specific_advantages" text[],
	"conversation_starters" text[],
	"battle_card_scenario" text,
	"battle_card_response" text,
	"win_theme" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitive_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"executive_summary" text,
	"primary_competitors" text[],
	"competitor_likelihood" jsonb,
	"korn_ferry_differentiators" text[],
	"key_win_themes" text[],
	"avoid_themes" text[],
	"industry_context" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "competitive_summary_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "dashboard_layouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"layout_config" jsonb NOT NULL,
	"widgets" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_artefacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"initiative_id" integer,
	"title" text NOT NULL,
	"artefact_type" text DEFAULT 'other' NOT NULL,
	"description" text,
	"content" text,
	"file_url" text,
	"external_url" text,
	"linked_kpi_ids" integer[],
	"linked_intervention_ids" integer[],
	"captured_date" timestamp,
	"captured_by" text,
	"client_approved" boolean DEFAULT false NOT NULL,
	"used_in_qbr_ids" integer[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_pack_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"item_id" integer,
	"action" text NOT NULL,
	"actor_id" text NOT NULL,
	"actor_name" text NOT NULL,
	"actor_role" text,
	"previous_value" jsonb,
	"new_value" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_pack_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"item_id" integer,
	"content" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"author_role" text NOT NULL,
	"comment_type" text DEFAULT 'feedback' NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_pack_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"evidence_phase" text,
	"confidence_level" text DEFAULT 'medium',
	"source_kind" text,
	"source_event_id" text,
	"source_meeting_id" text,
	"source_artifact_id" text,
	"source_raw_excerpt" text,
	"source_type" text,
	"source_id" integer,
	"links" jsonb,
	"claim" text NOT NULL,
	"claim_context" text,
	"content" jsonb,
	"story_thread_id" text,
	"preceding_item_id" integer,
	"following_item_id" integer,
	"proof_sources" jsonb,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_provenance" jsonb,
	"item_confidence_score" integer,
	"provenance_verified" boolean DEFAULT false NOT NULL,
	"item_status" text DEFAULT 'draft' NOT NULL,
	"reviewer_comment" text,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"coaching_tip" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"section" text,
	"value_pillar" text,
	"audience_scope" text DEFAULT 'both',
	"evidence_sensitivity" text DEFAULT 'client_shareable',
	"skill_domain" text,
	"skill_category" text,
	"metric_type" text,
	"metric_value" text,
	"metric_unit" text,
	"metric_baseline" text,
	"metric_target" text,
	"idempotency_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_pack_items_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "evidence_pack_lifecycle_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"resulting_updates" jsonb,
	"guidance_generated" boolean DEFAULT false NOT NULL,
	"guidance_event_ids" integer[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"account_id" integer,
	"title" text NOT NULL,
	"description" text,
	"version" integer DEFAULT 1 NOT NULL,
	"quality_score" integer,
	"provenance_score" integer,
	"confidence_score" integer,
	"assumptions_score" integer,
	"leader_score" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"ai_generated_at" timestamp,
	"ai_model_used" text,
	"ai_prompt_context" text,
	"reviewer_id" text,
	"reviewer_name" text,
	"review_started_at" timestamp,
	"review_completed_at" timestamp,
	"review_notes" text,
	"owner_id" text,
	"owner_name" text,
	"share_token" text,
	"shared_at" timestamp,
	"shared_with_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_packs_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "ga_competitor_battle_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"competitor_name" text NOT NULL,
	"competitor_website" text,
	"competitor_logo_url" text,
	"company_overview" text,
	"market_position" text,
	"target_customers" text,
	"products_services" jsonb,
	"pain_comparison" jsonb,
	"strengths" text[],
	"weaknesses" text[],
	"competitive_response" text,
	"their_barriers" text[],
	"our_barriers" text[],
	"win_strategies" text[],
	"loss_risks" text[],
	"market_maturity" text,
	"threat_level" text,
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ga_hypotheses" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"persona_id" integer,
	"buyer_hypothesis" text,
	"buyer_hypothesis_rationale" text,
	"buyer_hypothesis_fact_ids" text[],
	"buyer_hypothesis_behaviour_ids" text[],
	"problem_hypothesis" text,
	"problem_hypothesis_rationale" text,
	"problem_hypothesis_pain_ids" text[],
	"problem_hypothesis_goal_ids" text[],
	"solution_hypothesis" text,
	"solution_url" text,
	"solution_features" text[],
	"version" integer DEFAULT 1,
	"previous_version_id" integer,
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ga_interview_scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"script_title" text,
	"target_prediction_ids" integer[],
	"questions" jsonb,
	"simulated_transcript" text,
	"interviews_conducted" integer DEFAULT 0,
	"interview_summaries" jsonb,
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ga_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"hypothesis_id" integer,
	"prediction" text NOT NULL,
	"source_hypothesis" text NOT NULL,
	"impact_if_wrong" text NOT NULL,
	"confidence" text NOT NULL,
	"is_risky_prediction" boolean DEFAULT false,
	"experiment_status" text DEFAULT 'not_tested',
	"experiment_notes" text,
	"validated_at" timestamp,
	"linked_question_ids" integer[],
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ga_press_releases" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"headline" text,
	"paragraph1" text,
	"paragraph2" text,
	"paragraph3" text,
	"paragraph4" text,
	"paragraph5" text,
	"paragraph6" text,
	"full_document" text,
	"validation_status" text DEFAULT 'draft',
	"validation_feedback" jsonb,
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ga_sales_play_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"seller_actions" jsonb,
	"org_actions" jsonb,
	"sales_kit_items" jsonb,
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ga_solution_tenets" (
	"id" serial PRIMARY KEY NOT NULL,
	"canvas_id" integer NOT NULL,
	"tenets" jsonb,
	"strategic_preferences" jsonb,
	"solution_options" jsonb,
	"ai_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "growth_accelerator_canvases" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"account_id" integer,
	"title" text NOT NULL,
	"target_market" text,
	"target_solution" text,
	"current_section" text DEFAULT 'what_to_know',
	"current_step" text DEFAULT 'buyer_persona',
	"section_completion" jsonb,
	"ai_generated_at" timestamp,
	"ai_model_used" text,
	"status" text DEFAULT 'draft',
	"owner_id" text,
	"owner_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "handoff_packets" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"packet_name" text NOT NULL,
	"commitment_ids" integer[] NOT NULL,
	"generated_by_role" text NOT NULL,
	"generated_by_name" text,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"executive_summary" text,
	"client_visible_summary" text,
	"key_deliverables" text[],
	"total_committed_value" integer,
	"csm_owner_id" text,
	"csm_owner_name" text,
	"csm_owner_email" text,
	"acceptance_state" text DEFAULT 'pending' NOT NULL,
	"accepted_at" timestamp,
	"acceptance_notes" text,
	"clarification_requests" jsonb,
	"handoff_meeting_date" timestamp,
	"handoff_meeting_notes" text,
	"story_coach_context" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interaction_artifacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"artifact_type" text NOT NULL,
	"meeting_context" text NOT NULL,
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"object_storage_key" text,
	"title" text,
	"freeform_notes" text,
	"extracted_text" text,
	"meeting_date" timestamp,
	"meeting_type" text,
	"attendees" text[],
	"ai_processing_status" text DEFAULT 'pending' NOT NULL,
	"ai_extracted_insights" jsonb,
	"ai_summary" text,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpi_commitments" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"discovery_theme_id" text,
	"job_theme_id" integer,
	"strategic_pillar_id" integer,
	"pillar_objective_id" integer,
	"strategy_alignment_rationale" text,
	"value_pillar" text,
	"solution_pattern" text,
	"health_status" text DEFAULT 'needs_data',
	"commitment_title" text NOT NULL,
	"commitment_description" text,
	"kpi_id" integer,
	"custom_metric_name" text,
	"metric_unit" text,
	"baseline_value" text,
	"target_value" text,
	"target_date" timestamp,
	"customer_stakeholder_name" text,
	"customer_stakeholder_title" text,
	"customer_stakeholder_email" text,
	"kf_owner_role" text,
	"kf_owner_name" text,
	"estimated_annual_value" integer,
	"value_calculation_notes" text,
	"value_calculation_breakdown" jsonb,
	"baseline_provenance" jsonb,
	"target_provenance" jsonb,
	"success_narrative" text,
	"outcome_statement" text,
	"journey_phases" jsonb,
	"quick_wins" jsonb,
	"key_milestones" jsonb,
	"implementation_timeline" text,
	"delivery_readiness_score" integer,
	"delivery_notes" text,
	"collaboration_notes" text,
	"client_confirmed_at" timestamp,
	"client_confirmed_by" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"provenance" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpi_movement_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"success_frame_id" integer,
	"movements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"overall_health_score" integer,
	"overall_narrative" text,
	"last_calculated_at" timestamp DEFAULT now(),
	"calculation_source" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"attendance_mode" text DEFAULT 'single' NOT NULL,
	"meeting_title" text,
	"meeting_date" timestamp,
	"meeting_objective" text,
	"desired_outcome" text,
	"single_contact" jsonb,
	"participants" jsonb,
	"combined_meeting_story" jsonb,
	"participant_briefs" jsonb,
	"call_planner" jsonb,
	"generated_questions" jsonb,
	"transcript" text,
	"transcript_analysis" jsonb,
	"archived_participants" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"milestone_type" text DEFAULT 'custom' NOT NULL,
	"milestone_date" timestamp NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"linked_kpi_ids" integer[],
	"linked_review_id" integer,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pillar_objectives" (
	"id" serial PRIMARY KEY NOT NULL,
	"pillar_id" integer NOT NULL,
	"objective_type" text DEFAULT 'company' NOT NULL,
	"objective" text NOT NULL,
	"key_results" jsonb,
	"timeline" text,
	"sponsor" text,
	"status" text DEFAULT 'not_started' NOT NULL,
	"is_ai_suggested" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pillar_okr_themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"pillar_id" integer NOT NULL,
	"okr_theme_id" text NOT NULL,
	"is_ai_inferred" boolean DEFAULT false NOT NULL,
	"confidence" text,
	"rationale" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pillar_share_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"token" text NOT NULL,
	"permissions" text DEFAULT 'edit' NOT NULL,
	"customer_name" text,
	"customer_email" text,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_accessed_at" timestamp,
	CONSTRAINT "pillar_share_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "project_intelligence" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"discovery_theme" text NOT NULL,
	"intelligence_data" jsonb NOT NULL,
	"probe_history" jsonb,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"regenerated_at" timestamp,
	"generated_by" text
);
--> statement-breakpoint
CREATE TABLE "project_value_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"total_value_promised" integer,
	"value_promised_breakdown" jsonb,
	"total_value_realized" integer,
	"value_realized_breakdown" jsonb,
	"overall_progress_percent" integer,
	"kpis_on_track" integer DEFAULT 0 NOT NULL,
	"kpis_at_risk" integer DEFAULT 0 NOT NULL,
	"kpis_off_track" integer DEFAULT 0 NOT NULL,
	"kpis_no_data" integer DEFAULT 0 NOT NULL,
	"monthly_value_velocity" text,
	"projected_completion_date" timestamp,
	"confidence_level" integer,
	"last_review_date" timestamp,
	"next_review_date" timestamp,
	"client_sentiment_avg" integer,
	"last_calculated_at" timestamp DEFAULT now() NOT NULL,
	"calculation_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_value_metrics_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "salesforce_account_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"local_account_id" integer NOT NULL,
	"salesforce_account_id" text NOT NULL,
	"salesforce_account_name" text,
	"last_synced_at" timestamp,
	"sync_status" text DEFAULT 'synced' NOT NULL,
	"last_sync_direction" text,
	"sync_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salesforce_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"instance_url" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_issued_at" timestamp NOT NULL,
	"token_expires_at" timestamp,
	"user_id" text,
	"user_name" text,
	"org_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salesforce_opportunity_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"local_commitment_id" integer NOT NULL,
	"salesforce_opportunity_id" text NOT NULL,
	"salesforce_opportunity_name" text,
	"last_synced_at" timestamp,
	"sync_status" text DEFAULT 'synced' NOT NULL,
	"last_sync_direction" text,
	"sync_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salesforce_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"integration_id" integer NOT NULL,
	"sync_type" text NOT NULL,
	"direction" text NOT NULL,
	"status" text NOT NULL,
	"records_processed" integer DEFAULT 0,
	"records_created" integer DEFAULT 0,
	"records_updated" integer DEFAULT 0,
	"records_skipped" integer DEFAULT 0,
	"records_failed" integer DEFAULT 0,
	"errors" jsonb,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsor_narrative_spines" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"previous_version_id" integer,
	"spine" jsonb NOT NULL,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_generated_at" timestamp,
	"ai_model" text,
	"ai_confidence" integer,
	"human_reviewed_at" timestamp,
	"human_reviewed_by" text,
	"human_edits" jsonb,
	"last_exported_as" text,
	"last_exported_at" timestamp,
	"export_history" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategic_pillars" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner" text,
	"priority" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_ai_suggested" boolean DEFAULT false NOT NULL,
	"confidence" text,
	"provenance" jsonb,
	"source_insight_ids" integer[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"generated_strategies" jsonb,
	"selected_strategy_ids" text[],
	"generated_outcomes" jsonb,
	"selected_outcome_ids" text[],
	"status" text DEFAULT 'draft' NOT NULL,
	"strategies_generated_at" timestamp,
	"strategies_selected_at" timestamp,
	"outcomes_generated_at" timestamp,
	"outcomes_confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "success_frame_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_current_version" boolean DEFAULT true NOT NULL,
	"previous_version_id" integer,
	"kpis" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"uncertainty_statement" text,
	"assumptions_notes" text,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp,
	"locked_by" text,
	"ai_inferred" boolean DEFAULT false NOT NULL,
	"ai_inference_source" text,
	"ai_confirmed_by" text,
	"ai_confirmed_at" timestamp,
	"sponsor_approved" boolean DEFAULT false NOT NULL,
	"sponsor_approved_at" timestamp,
	"sponsor_approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "success_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text DEFAULT 'Success Plan' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"desired_outcomes" jsonb,
	"customer_responsibilities" text[],
	"vendor_responsibilities" text[],
	"executive_sponsor" text,
	"delivery_lead" text,
	"kickoff_date" timestamp,
	"target_completion_date" timestamp,
	"review_cadence" text DEFAULT 'monthly',
	"next_review_date" timestamp,
	"overall_progress" integer DEFAULT 0,
	"risk_level" text DEFAULT 'low',
	"risk_notes" text,
	"created_by" text,
	"last_updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "success_story_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"industry" text NOT NULL,
	"client_type" text,
	"capability_name" text NOT NULL,
	"solution_area" text NOT NULL,
	"related_kpis" text[],
	"challenge" text NOT NULL,
	"solution" text NOT NULL,
	"results" text NOT NULL,
	"metrics" jsonb,
	"timeframe_months" integer,
	"verification_source" text NOT NULL,
	"source_url" text,
	"approval_status" text DEFAULT 'pending' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp,
	"tags" text[],
	"is_highlighted" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "value_justification_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"value_justification_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"suggested_changes" jsonb,
	"applied_to_version" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "value_justifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"job_theme_id" integer NOT NULL,
	"title" text NOT NULL,
	"draft_content" text,
	"executive_summary" text,
	"ai_session_id" text,
	"ai_model_version" text,
	"linked_discovery_insight_ids" integer[],
	"linked_question_response_ids" integer[],
	"linked_note_ids" integer[],
	"linked_kpi_ids" integer[],
	"projected_value" integer,
	"projected_value_timeframe" text,
	"confidence_level" text,
	"version" integer DEFAULT 1 NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp,
	"locked_by" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "value_hypotheses" ALTER COLUMN "capability_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "value_hypotheses" ALTER COLUMN "solution_area" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "discovery_questions" ADD COLUMN "methodology" text;--> statement-breakpoint
ALTER TABLE "discovery_questions" ADD COLUMN "methodology_stage" text;--> statement-breakpoint
ALTER TABLE "discovery_questions" ADD COLUMN "follow_up_hint" text;--> statement-breakpoint
ALTER TABLE "discovery_questions" ADD COLUMN "is_asked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "discovery_questions" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "interventions" ADD COLUMN "intervention_type" text;--> statement-breakpoint
ALTER TABLE "interventions" ADD COLUMN "targeted_kpi_ids" integer[];--> statement-breakpoint
ALTER TABLE "interventions" ADD COLUMN "estimated_cost" text;--> statement-breakpoint
ALTER TABLE "interventions" ADD COLUMN "estimated_impact" text;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "baseline_entered_by" text;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "baseline_entered_by_name" text;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "target_entered_by" text;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "target_entered_by_name" text;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "customer_comment" text;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "customer_commented_at" timestamp;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "is_ai_recommended" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "ai_strategic_rationale" text;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "ai_achievability_score" integer;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "ai_value_impact_score" integer;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "ai_korn_ferry_benchmark" text;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "ai_industry_benchmark" jsonb;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "ai_target_recommendation" jsonb;--> statement-breakpoint
ALTER TABLE "job_theme_kpis" ADD COLUMN "estimated_value_per_unit" integer;--> statement-breakpoint
ALTER TABLE "job_themes" ADD COLUMN "pillar_id" integer;--> statement-breakpoint
ALTER TABLE "job_themes" ADD COLUMN "pillar_linkage_narrative" text;--> statement-breakpoint
ALTER TABLE "job_themes" ADD COLUMN "source_response_ids" integer[];--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "account_id" integer;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "measurement_period" text;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "recorded_by_role" text;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "confidence_score" integer;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "value_impact" text;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "value_impact_amount" integer;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "variance" text;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "variance_direction" text;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "linked_intervention_id" integer;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "linked_milestone_id" integer;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD COLUMN "linked_artefact_ids" integer[];--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "account_id" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "lifecycle_phase" text DEFAULT 'discover_qualify';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "initiative_owner" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_lead" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "target_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "conditions_for_success" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "rag_status" text DEFAULT 'green';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "sales_stage" text DEFAULT 'discover';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "delivery_stage" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "handoff_notes" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "handoff_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "handoff_confirmed_by" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "cs_lifecycle_stage" text DEFAULT 'onboarding';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "health_score" integer DEFAULT 100;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "maturity_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_health_update" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "health_factors" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "handoff_package" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "discovery_theme" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "discovery_step" text DEFAULT 'theme-select';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "discovery_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "narrative_canvas" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "green_sheet_data" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "story_builder_data" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "call_flow_data" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "discovery_synthesis" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "outcome_recommendations" jsonb;--> statement-breakpoint
ALTER TABLE "value_hypotheses" ADD COLUMN "linked_job_theme_ids" integer[];--> statement-breakpoint
ALTER TABLE "value_hypotheses" ADD COLUMN "suggested_kpis" text[];--> statement-breakpoint
ALTER TABLE "value_hypotheses" ADD COLUMN "estimated_npv" text;--> statement-breakpoint
ALTER TABLE "value_hypotheses" ADD COLUMN "estimated_payback_months" integer;--> statement-breakpoint
ALTER TABLE "account_issues" ADD CONSTRAINT "account_issues_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_user_roles" ADD CONSTRAINT "account_user_roles_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_guidance_events" ADD CONSTRAINT "ai_guidance_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_guidance_events" ADD CONSTRAINT "ai_guidance_events_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_session_id_ai_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alignment_share_links" ADD CONSTRAINT "alignment_share_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavioural_condition_logs" ADD CONSTRAINT "behavioural_condition_logs_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "behavioural_condition_logs" ADD CONSTRAINT "behavioural_condition_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blue_sheets" ADD CONSTRAINT "blue_sheets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_journeys" ADD CONSTRAINT "buyer_journeys_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_journeys" ADD CONSTRAINT "buyer_journeys_persona_id_buyer_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."buyer_personas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_personas" ADD CONSTRAINT "buyer_personas_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_intelligence" ADD CONSTRAINT "competitive_intelligence_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_summary" ADD CONSTRAINT "competitive_summary_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_layouts" ADD CONSTRAINT "dashboard_layouts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_artefacts" ADD CONSTRAINT "evidence_artefacts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_pack_audit_log" ADD CONSTRAINT "evidence_pack_audit_log_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_pack_audit_log" ADD CONSTRAINT "evidence_pack_audit_log_item_id_evidence_pack_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."evidence_pack_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_pack_comments" ADD CONSTRAINT "evidence_pack_comments_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_pack_comments" ADD CONSTRAINT "evidence_pack_comments_item_id_evidence_pack_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."evidence_pack_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_pack_items" ADD CONSTRAINT "evidence_pack_items_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_pack_lifecycle_events" ADD CONSTRAINT "evidence_pack_lifecycle_events_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_pack_lifecycle_events" ADD CONSTRAINT "evidence_pack_lifecycle_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_packs" ADD CONSTRAINT "evidence_packs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_packs" ADD CONSTRAINT "evidence_packs_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_competitor_battle_cards" ADD CONSTRAINT "ga_competitor_battle_cards_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_hypotheses" ADD CONSTRAINT "ga_hypotheses_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_hypotheses" ADD CONSTRAINT "ga_hypotheses_persona_id_buyer_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."buyer_personas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_interview_scripts" ADD CONSTRAINT "ga_interview_scripts_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_predictions" ADD CONSTRAINT "ga_predictions_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_predictions" ADD CONSTRAINT "ga_predictions_hypothesis_id_ga_hypotheses_id_fk" FOREIGN KEY ("hypothesis_id") REFERENCES "public"."ga_hypotheses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_press_releases" ADD CONSTRAINT "ga_press_releases_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_sales_play_actions" ADD CONSTRAINT "ga_sales_play_actions_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ga_solution_tenets" ADD CONSTRAINT "ga_solution_tenets_canvas_id_growth_accelerator_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."growth_accelerator_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "growth_accelerator_canvases" ADD CONSTRAINT "growth_accelerator_canvases_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "growth_accelerator_canvases" ADD CONSTRAINT "growth_accelerator_canvases_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handoff_packets" ADD CONSTRAINT "handoff_packets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interaction_artifacts" ADD CONSTRAINT "interaction_artifacts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_commitments" ADD CONSTRAINT "kpi_commitments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_commitments" ADD CONSTRAINT "kpi_commitments_job_theme_id_job_themes_id_fk" FOREIGN KEY ("job_theme_id") REFERENCES "public"."job_themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_commitments" ADD CONSTRAINT "kpi_commitments_strategic_pillar_id_strategic_pillars_id_fk" FOREIGN KEY ("strategic_pillar_id") REFERENCES "public"."strategic_pillars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_commitments" ADD CONSTRAINT "kpi_commitments_pillar_objective_id_pillar_objectives_id_fk" FOREIGN KEY ("pillar_objective_id") REFERENCES "public"."pillar_objectives"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_commitments" ADD CONSTRAINT "kpi_commitments_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_movement_views" ADD CONSTRAINT "kpi_movement_views_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_movement_views" ADD CONSTRAINT "kpi_movement_views_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_movement_views" ADD CONSTRAINT "kpi_movement_views_success_frame_id_success_frame_snapshots_id_fk" FOREIGN KEY ("success_frame_id") REFERENCES "public"."success_frame_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_profiles" ADD CONSTRAINT "meeting_profiles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_linked_review_id_business_reviews_id_fk" FOREIGN KEY ("linked_review_id") REFERENCES "public"."business_reviews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pillar_objectives" ADD CONSTRAINT "pillar_objectives_pillar_id_strategic_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."strategic_pillars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pillar_okr_themes" ADD CONSTRAINT "pillar_okr_themes_pillar_id_strategic_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."strategic_pillars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pillar_share_links" ADD CONSTRAINT "pillar_share_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_intelligence" ADD CONSTRAINT "project_intelligence_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_value_metrics" ADD CONSTRAINT "project_value_metrics_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salesforce_account_links" ADD CONSTRAINT "salesforce_account_links_local_account_id_accounts_id_fk" FOREIGN KEY ("local_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salesforce_opportunity_links" ADD CONSTRAINT "salesforce_opportunity_links_local_commitment_id_kpi_commitments_id_fk" FOREIGN KEY ("local_commitment_id") REFERENCES "public"."kpi_commitments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salesforce_sync_logs" ADD CONSTRAINT "salesforce_sync_logs_integration_id_salesforce_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."salesforce_integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor_narrative_spines" ADD CONSTRAINT "sponsor_narrative_spines_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor_narrative_spines" ADD CONSTRAINT "sponsor_narrative_spines_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategic_pillars" ADD CONSTRAINT "strategic_pillars_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_selections" ADD CONSTRAINT "strategy_selections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "success_frame_snapshots" ADD CONSTRAINT "success_frame_snapshots_pack_id_evidence_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."evidence_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "success_frame_snapshots" ADD CONSTRAINT "success_frame_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "success_plans" ADD CONSTRAINT "success_plans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "value_justification_messages" ADD CONSTRAINT "value_justification_messages_value_justification_id_value_justifications_id_fk" FOREIGN KEY ("value_justification_id") REFERENCES "public"."value_justifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "value_justifications" ADD CONSTRAINT "value_justifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "value_justifications" ADD CONSTRAINT "value_justifications_job_theme_id_job_themes_id_fk" FOREIGN KEY ("job_theme_id") REFERENCES "public"."job_themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD CONSTRAINT "kpi_actuals_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD CONSTRAINT "kpi_actuals_linked_intervention_id_interventions_id_fk" FOREIGN KEY ("linked_intervention_id") REFERENCES "public"."interventions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_actuals" ADD CONSTRAINT "kpi_actuals_linked_milestone_id_milestones_id_fk" FOREIGN KEY ("linked_milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;