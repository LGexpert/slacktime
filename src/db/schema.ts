import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'tsvector'
  },
})

export const themePreferenceEnum = pgEnum('theme_preference', ['system', 'light', 'dark'])

export const userActivityTypeEnum = pgEnum('user_activity_type', [
  'watch',
  'favorite',
  'watchlist_add',
  'playlist_add',
  'search',
])

export const videoRelationTypeEnum = pgEnum('video_relation_type', ['recommended', 'similar', 'next'])

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailUnique: uniqueIndex('users_email_unique').on(t.email),
  }),
)

export const authIdentities = pgTable(
  'auth_identities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerUserId: text('provider_user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    providerUnique: uniqueIndex('auth_identities_provider_unique').on(t.provider, t.providerUserId),
    userIdx: index('auth_identities_user_id_idx').on(t.userId),
  }),
)

export const authPasswords = pgTable(
  'auth_passwords',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    passwordHash: text('password_hash').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('auth_passwords_user_id_idx').on(t.userId),
  }),
)

export const authSessions = pgTable(
  'auth_sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('auth_sessions_user_id_idx').on(t.userId),
    expiresIdx: index('auth_sessions_expires_at_idx').on(t.expiresAt),
  }),
)

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
  },
  (t) => ({
    userIdx: index('password_reset_tokens_user_id_idx').on(t.userId),
    expiresIdx: index('password_reset_tokens_expires_at_idx').on(t.expiresAt),
  }),
)

export const userProfiles = pgTable(
  'user_profiles',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    themePreference: themePreferenceEnum('theme_preference').default('system').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    displayNameIdx: index('user_profiles_display_name_idx').on(t.displayName),
  }),
)

export const artists = pgTable(
  'artists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),
    searchVector: tsvector('search_vector').default(sql`''::tsvector`).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex('artists_slug_unique').on(t.slug),
    nameUnique: uniqueIndex('artists_name_unique').on(t.name),
    searchIdx: index('artists_search_vector_idx').using('gin', t.searchVector),
  }),
)

export const genres = pgTable(
  'genres',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    searchVector: tsvector('search_vector').default(sql`''::tsvector`).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex('genres_slug_unique').on(t.slug),
    nameUnique: uniqueIndex('genres_name_unique').on(t.name),
    searchIdx: index('genres_search_vector_idx').using('gin', t.searchVector),
  }),
)

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    searchVector: tsvector('search_vector').default(sql`''::tsvector`).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex('tags_slug_unique').on(t.slug),
    nameUnique: uniqueIndex('tags_name_unique').on(t.name),
    searchIdx: index('tags_search_vector_idx').using('gin', t.searchVector),
  }),
)

export const videos = pgTable(
  'videos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    durationSeconds: integer('duration_seconds').notNull(),
    description: text('description'),
    thumbnails: jsonb('thumbnails'),
    streamingSources: jsonb('streaming_sources'),
    stats: jsonb('stats'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    searchVector: tsvector('search_vector').default(sql`''::tsvector`).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex('videos_slug_unique').on(t.slug),
    searchIdx: index('videos_search_vector_idx').using('gin', t.searchVector),
  }),
)

export const videoArtists = pgTable(
  'video_artists',
  {
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    artistId: uuid('artist_id')
      .notNull()
      .references(() => artists.id, { onDelete: 'cascade' }),
    role: text('role'),
    position: integer('position').default(0).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.videoId, t.artistId] }),
    videoIdx: index('video_artists_video_id_idx').on(t.videoId),
    artistIdx: index('video_artists_artist_id_idx').on(t.artistId),
  }),
)

export const videoGenres = pgTable(
  'video_genres',
  {
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    genreId: uuid('genre_id')
      .notNull()
      .references(() => genres.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.videoId, t.genreId] }),
    videoIdx: index('video_genres_video_id_idx').on(t.videoId),
    genreIdx: index('video_genres_genre_id_idx').on(t.genreId),
  }),
)

export const videoTags = pgTable(
  'video_tags',
  {
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.videoId, t.tagId] }),
    videoIdx: index('video_tags_video_id_idx').on(t.videoId),
    tagIdx: index('video_tags_tag_id_idx').on(t.tagId),
  }),
)

export const lyricLines = pgTable(
  'lyric_lines',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    timeMs: integer('time_ms').notNull(),
    language: text('language').default('en').notNull(),
    text: text('text').notNull(),
    searchVector: tsvector('search_vector').default(sql`''::tsvector`).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    videoIdx: index('lyric_lines_video_id_idx').on(t.videoId),
    timeIdx: index('lyric_lines_time_ms_idx').on(t.videoId, t.timeMs),
    searchIdx: index('lyric_lines_search_vector_idx').using('gin', t.searchVector),
  }),
)

export const playlists = pgTable(
  'playlists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    isPublic: boolean('is_public').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('playlists_user_id_idx').on(t.userId),
  }),
)

export const playlistItems = pgTable(
  'playlist_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    playlistId: uuid('playlist_id')
      .notNull()
      .references(() => playlists.id, { onDelete: 'cascade' }),
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    position: integer('position').default(0).notNull(),
    addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    playlistIdx: index('playlist_items_playlist_id_idx').on(t.playlistId),
    videoIdx: index('playlist_items_video_id_idx').on(t.videoId),
    uniquePosition: uniqueIndex('playlist_items_unique_position').on(t.playlistId, t.position),
  }),
)

export const favorites = pgTable(
  'favorites',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.videoId] }),
    userIdx: index('favorites_user_id_idx').on(t.userId),
    videoIdx: index('favorites_video_id_idx').on(t.videoId),
  }),
)

export const watchlist = pgTable(
  'watchlist',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.videoId] }),
    userIdx: index('watchlist_user_id_idx').on(t.userId),
    videoIdx: index('watchlist_video_id_idx').on(t.videoId),
  }),
)

export const userActivity = pgTable(
  'user_activity',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    videoId: uuid('video_id').references(() => videos.id, { onDelete: 'set null' }),
    activityType: userActivityTypeEnum('activity_type').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('user_activity_user_id_idx').on(t.userId),
    videoIdx: index('user_activity_video_id_idx').on(t.videoId),
    typeIdx: index('user_activity_type_idx').on(t.activityType),
  }),
)

export const videoRelations = pgTable(
  'video_relations',
  {
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    relatedVideoId: uuid('related_video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    relationType: videoRelationTypeEnum('relation_type').default('recommended').notNull(),
    weight: real('weight').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.videoId, t.relatedVideoId, t.relationType] }),
    videoIdx: index('video_relations_video_id_idx').on(t.videoId),
    relatedIdx: index('video_relations_related_video_id_idx').on(t.relatedVideoId),
  }),
)

export const usersRelations = relations(users, ({ many, one }) => ({
  authIdentities: many(authIdentities),
  password: one(authPasswords, { fields: [users.id], references: [authPasswords.userId] }),
  sessions: many(authSessions),
  passwordResetTokens: many(passwordResetTokens),
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  playlists: many(playlists),
  favorites: many(favorites),
  watchlist: many(watchlist),
  activity: many(userActivity),
}))

export const authIdentitiesRelations = relations(authIdentities, ({ one }) => ({
  user: one(users, { fields: [authIdentities.userId], references: [users.id] }),
}))

export const authPasswordsRelations = relations(authPasswords, ({ one }) => ({
  user: one(users, { fields: [authPasswords.userId], references: [users.id] }),
}))

export const authSessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, { fields: [authSessions.userId], references: [users.id] }),
}))

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}))

export const artistsRelations = relations(artists, ({ many }) => ({
  videoArtists: many(videoArtists),
}))

export const genresRelations = relations(genres, ({ many }) => ({
  videoGenres: many(videoGenres),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  videoTags: many(videoTags),
}))

export const videosRelations = relations(videos, ({ many }) => ({
  videoArtists: many(videoArtists),
  videoGenres: many(videoGenres),
  videoTags: many(videoTags),
  lyricLines: many(lyricLines),
  playlistItems: many(playlistItems),
  favorites: many(favorites),
  watchlist: many(watchlist),
  activity: many(userActivity),
  relatedFrom: many(videoRelations, { relationName: 'related_from' }),
  relatedTo: many(videoRelations, { relationName: 'related_to' }),
}))

export const videoArtistsRelations = relations(videoArtists, ({ one }) => ({
  video: one(videos, { fields: [videoArtists.videoId], references: [videos.id] }),
  artist: one(artists, { fields: [videoArtists.artistId], references: [artists.id] }),
}))

export const videoGenresRelations = relations(videoGenres, ({ one }) => ({
  video: one(videos, { fields: [videoGenres.videoId], references: [videos.id] }),
  genre: one(genres, { fields: [videoGenres.genreId], references: [genres.id] }),
}))

export const videoTagsRelations = relations(videoTags, ({ one }) => ({
  video: one(videos, { fields: [videoTags.videoId], references: [videos.id] }),
  tag: one(tags, { fields: [videoTags.tagId], references: [tags.id] }),
}))

export const lyricLinesRelations = relations(lyricLines, ({ one }) => ({
  video: one(videos, { fields: [lyricLines.videoId], references: [videos.id] }),
}))

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, { fields: [playlists.userId], references: [users.id] }),
  items: many(playlistItems),
}))

export const playlistItemsRelations = relations(playlistItems, ({ one }) => ({
  playlist: one(playlists, { fields: [playlistItems.playlistId], references: [playlists.id] }),
  video: one(videos, { fields: [playlistItems.videoId], references: [videos.id] }),
}))

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  video: one(videos, { fields: [favorites.videoId], references: [videos.id] }),
}))

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, { fields: [watchlist.userId], references: [users.id] }),
  video: one(videos, { fields: [watchlist.videoId], references: [videos.id] }),
}))

export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(users, { fields: [userActivity.userId], references: [users.id] }),
  video: one(videos, { fields: [userActivity.videoId], references: [videos.id] }),
}))

export const videoRelationsRelations = relations(videoRelations, ({ one }) => ({
  video: one(videos, {
    fields: [videoRelations.videoId],
    references: [videos.id],
    relationName: 'related_from',
  }),
  relatedVideo: one(videos, {
    fields: [videoRelations.relatedVideoId],
    references: [videos.id],
    relationName: 'related_to',
  }),
}))
