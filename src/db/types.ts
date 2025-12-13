import type {
  authIdentities,
  artists,
  favorites,
  genres,
  lyricLines,
  playlistItems,
  playlists,
  tags,
  userActivity,
  userProfiles,
  users,
  videoArtists,
  videoGenres,
  videoRelations,
  videos,
  videoTags,
  watchlist,
} from './schema'

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type AuthIdentity = typeof authIdentities.$inferSelect
export type NewAuthIdentity = typeof authIdentities.$inferInsert

export type UserProfile = typeof userProfiles.$inferSelect
export type NewUserProfile = typeof userProfiles.$inferInsert

export type Artist = typeof artists.$inferSelect
export type NewArtist = typeof artists.$inferInsert

export type Genre = typeof genres.$inferSelect
export type NewGenre = typeof genres.$inferInsert

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert

export type VideoArtist = typeof videoArtists.$inferSelect
export type NewVideoArtist = typeof videoArtists.$inferInsert

export type VideoGenre = typeof videoGenres.$inferSelect
export type NewVideoGenre = typeof videoGenres.$inferInsert

export type VideoTag = typeof videoTags.$inferSelect
export type NewVideoTag = typeof videoTags.$inferInsert

export type LyricLine = typeof lyricLines.$inferSelect
export type NewLyricLine = typeof lyricLines.$inferInsert

export type Playlist = typeof playlists.$inferSelect
export type NewPlaylist = typeof playlists.$inferInsert

export type PlaylistItem = typeof playlistItems.$inferSelect
export type NewPlaylistItem = typeof playlistItems.$inferInsert

export type Favorite = typeof favorites.$inferSelect
export type NewFavorite = typeof favorites.$inferInsert

export type WatchlistItem = typeof watchlist.$inferSelect
export type NewWatchlistItem = typeof watchlist.$inferInsert

export type UserActivity = typeof userActivity.$inferSelect
export type NewUserActivity = typeof userActivity.$inferInsert

export type VideoRelation = typeof videoRelations.$inferSelect
export type NewVideoRelation = typeof videoRelations.$inferInsert
