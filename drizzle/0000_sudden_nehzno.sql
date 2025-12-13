CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."theme_preference" AS ENUM('system', 'light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."user_activity_type" AS ENUM('watch', 'favorite', 'watchlist_add', 'playlist_add', 'search');--> statement-breakpoint
CREATE TYPE "public"."video_relation_type" AS ENUM('recommended', 'similar', 'next');--> statement-breakpoint
CREATE TABLE "artists" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" text NOT NULL,
    "name" text NOT NULL,
    "bio" text,
    "avatar_url" text,
    "search_vector" "tsvector" DEFAULT ''::tsvector NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "provider" text NOT NULL,
    "provider_user_id" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
    "user_id" uuid NOT NULL,
    "video_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "favorites_user_id_video_id_pk" PRIMARY KEY("user_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "genres" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" text NOT NULL,
    "name" text NOT NULL,
    "search_vector" "tsvector" DEFAULT ''::tsvector NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lyric_lines" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "video_id" uuid NOT NULL,
    "time_ms" integer NOT NULL,
    "language" text DEFAULT 'en' NOT NULL,
    "text" text NOT NULL,
    "search_vector" "tsvector" DEFAULT ''::tsvector NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlist_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "playlist_id" uuid NOT NULL,
    "video_id" uuid NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlists" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "is_public" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" text NOT NULL,
    "name" text NOT NULL,
    "search_vector" "tsvector" DEFAULT ''::tsvector NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "video_id" uuid,
    "activity_type" "user_activity_type" NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
    "user_id" uuid PRIMARY KEY NOT NULL,
    "display_name" text,
    "avatar_url" text,
    "bio" text,
    "theme_preference" "theme_preference" DEFAULT 'system' NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_artists" (
    "video_id" uuid NOT NULL,
    "artist_id" uuid NOT NULL,
    "role" text,
    "position" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "video_artists_video_id_artist_id_pk" PRIMARY KEY("video_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE "video_genres" (
    "video_id" uuid NOT NULL,
    "genre_id" uuid NOT NULL,
    CONSTRAINT "video_genres_video_id_genre_id_pk" PRIMARY KEY("video_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "video_relations" (
    "video_id" uuid NOT NULL,
    "related_video_id" uuid NOT NULL,
    "relation_type" "video_relation_type" DEFAULT 'recommended' NOT NULL,
    "weight" real DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "video_relations_video_id_related_video_id_relation_type_pk" PRIMARY KEY("video_id","related_video_id","relation_type")
);
--> statement-breakpoint
CREATE TABLE "video_tags" (
    "video_id" uuid NOT NULL,
    "tag_id" uuid NOT NULL,
    CONSTRAINT "video_tags_video_id_tag_id_pk" PRIMARY KEY("video_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "videos" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "slug" text NOT NULL,
    "title" text NOT NULL,
    "duration_seconds" integer NOT NULL,
    "description" text,
    "thumbnails" jsonb,
    "streaming_sources" jsonb,
    "stats" jsonb,
    "published_at" timestamp with time zone,
    "search_vector" "tsvector" DEFAULT ''::tsvector NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
    "user_id" uuid NOT NULL,
    "video_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "watchlist_user_id_video_id_pk" PRIMARY KEY("user_id","video_id")
);
--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lyric_lines" ADD CONSTRAINT "lyric_lines_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_artists" ADD CONSTRAINT "video_artists_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_artists" ADD CONSTRAINT "video_artists_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_genres" ADD CONSTRAINT "video_genres_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_genres" ADD CONSTRAINT "video_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_relations" ADD CONSTRAINT "video_relations_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_relations" ADD CONSTRAINT "video_relations_related_video_id_videos_id_fk" FOREIGN KEY ("related_video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "artists_slug_unique" ON "artists" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "artists_name_unique" ON "artists" USING btree ("name");--> statement-breakpoint
CREATE INDEX "artists_search_vector_idx" ON "artists" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_provider_unique" ON "auth_identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "auth_identities_user_id_idx" ON "auth_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorites_user_id_idx" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorites_video_id_idx" ON "favorites" USING btree ("video_id");--> statement-breakpoint
CREATE UNIQUE INDEX "genres_slug_unique" ON "genres" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "genres_name_unique" ON "genres" USING btree ("name");--> statement-breakpoint
CREATE INDEX "genres_search_vector_idx" ON "genres" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "lyric_lines_video_id_idx" ON "lyric_lines" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "lyric_lines_time_ms_idx" ON "lyric_lines" USING btree ("video_id","time_ms");--> statement-breakpoint
CREATE INDEX "lyric_lines_search_vector_idx" ON "lyric_lines" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "playlist_items_playlist_id_idx" ON "playlist_items" USING btree ("playlist_id");--> statement-breakpoint
CREATE INDEX "playlist_items_video_id_idx" ON "playlist_items" USING btree ("video_id");--> statement-breakpoint
CREATE UNIQUE INDEX "playlist_items_unique_position" ON "playlist_items" USING btree ("playlist_id","position");--> statement-breakpoint
CREATE INDEX "playlists_user_id_idx" ON "playlists" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_unique" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_unique" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tags_search_vector_idx" ON "tags" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "user_activity_user_id_idx" ON "user_activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_video_id_idx" ON "user_activity" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "user_activity_type_idx" ON "user_activity" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "user_profiles_display_name_idx" ON "user_profiles" USING btree ("display_name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "video_artists_video_id_idx" ON "video_artists" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_artists_artist_id_idx" ON "video_artists" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "video_genres_video_id_idx" ON "video_genres" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_genres_genre_id_idx" ON "video_genres" USING btree ("genre_id");--> statement-breakpoint
CREATE INDEX "video_relations_video_id_idx" ON "video_relations" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_relations_related_video_id_idx" ON "video_relations" USING btree ("related_video_id");--> statement-breakpoint
CREATE INDEX "video_tags_video_id_idx" ON "video_tags" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_tags_tag_id_idx" ON "video_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "videos_slug_unique" ON "videos" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "videos_search_vector_idx" ON "videos" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "watchlist_user_id_idx" ON "watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watchlist_video_id_idx" ON "watchlist" USING btree ("video_id");--> statement-breakpoint

CREATE TRIGGER artists_search_vector_update
BEFORE INSERT OR UPDATE ON "artists"
FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.simple', name, bio);--> statement-breakpoint

CREATE TRIGGER genres_search_vector_update
BEFORE INSERT OR UPDATE ON "genres"
FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.simple', name);--> statement-breakpoint

CREATE TRIGGER tags_search_vector_update
BEFORE INSERT OR UPDATE ON "tags"
FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.simple', name);--> statement-breakpoint

CREATE TRIGGER videos_search_vector_update
BEFORE INSERT OR UPDATE ON "videos"
FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.simple', title, description);--> statement-breakpoint

CREATE TRIGGER lyric_lines_search_vector_update
BEFORE INSERT OR UPDATE ON "lyric_lines"
FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.simple', "text");