import { sql } from 'drizzle-orm'

import { createDb, createPool } from '../../db/client'
import {
  artists,
  authIdentities,
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
} from '../../src/db/schema'

const shouldReset = process.argv.includes('--reset') || process.env.SEED_RESET === '1'

const pool = createPool()
const db = createDb(pool)

if (shouldReset) {
  await db.execute(sql`
    TRUNCATE TABLE
      video_relations,
      user_activity,
      favorites,
      watchlist,
      playlist_items,
      playlists,
      lyric_lines,
      video_tags,
      video_genres,
      video_artists,
      videos,
      tags,
      genres,
      artists,
      password_reset_tokens,
      auth_sessions,
      auth_passwords,
      auth_identities,
      user_profiles,
      users
    RESTART IDENTITY CASCADE;
  `)
}

const ids = {
  userA: '00000000-0000-0000-0000-000000000001',
  artistA: '00000000-0000-0000-0000-000000000101',
  artistB: '00000000-0000-0000-0000-000000000102',
  artistC: '00000000-0000-0000-0000-000000000103',
  genrePop: '00000000-0000-0000-0000-000000000201',
  genreElectronic: '00000000-0000-0000-0000-000000000202',
  genreIndie: '00000000-0000-0000-0000-000000000203',
  tagChill: '00000000-0000-0000-0000-000000000301',
  tagWorkout: '00000000-0000-0000-0000-000000000302',
  tagAcoustic: '00000000-0000-0000-0000-000000000303',
  videoA: '00000000-0000-0000-0000-000000001001',
  videoB: '00000000-0000-0000-0000-000000001002',
  videoC: '00000000-0000-0000-0000-000000001003',
  playlistA: '00000000-0000-0000-0000-000000002001',
}

await db
  .insert(users)
  .values({
    id: ids.userA,
    email: 'demo.user@example.com',
  })
  .onConflictDoNothing()

await db
  .insert(authIdentities)
  .values({
    userId: ids.userA,
    provider: 'email',
    providerUserId: 'demo.user@example.com',
  })
  .onConflictDoNothing()

await db
  .insert(userProfiles)
  .values({
    userId: ids.userA,
    displayName: 'Demo User',
    avatarUrl: 'https://picsum.photos/seed/demo-user/128/128',
    bio: 'Seeded account for UI development & integration tests.',
    themePreference: 'system',
  })
  .onConflictDoNothing()

await db
  .insert(artists)
  .values([
    {
      id: ids.artistA,
      slug: 'the-examplettes',
      name: 'The Examplettes',
      bio: 'Bright pop hooks and tidy harmonies.',
      avatarUrl: 'https://picsum.photos/seed/artist-a/256/256',
    },
    {
      id: ids.artistB,
      slug: 'dj-placeholder',
      name: 'DJ Placeholder',
      bio: 'Four-on-the-floor demos for late-night drives.',
      avatarUrl: 'https://picsum.photos/seed/artist-b/256/256',
    },
    {
      id: ids.artistC,
      slug: 'synth-unit',
      name: 'Synth Unit',
      bio: 'Cinematic synth textures and neon melodies.',
      avatarUrl: 'https://picsum.photos/seed/artist-c/256/256',
    },
  ])
  .onConflictDoNothing()

await db
  .insert(genres)
  .values([
    { id: ids.genrePop, slug: 'pop', name: 'Pop' },
    { id: ids.genreElectronic, slug: 'electronic', name: 'Electronic' },
    { id: ids.genreIndie, slug: 'indie', name: 'Indie' },
  ])
  .onConflictDoNothing()

await db
  .insert(tags)
  .values([
    { id: ids.tagChill, slug: 'chill', name: 'Chill' },
    { id: ids.tagWorkout, slug: 'workout', name: 'Workout' },
    { id: ids.tagAcoustic, slug: 'acoustic', name: 'Acoustic' },
  ])
  .onConflictDoNothing()

await db
  .insert(videos)
  .values([
    {
      id: ids.videoA,
      slug: 'midnight-drive',
      title: 'Midnight Drive',
      durationSeconds: 213,
      description: 'A steady beat for city lights and empty roads.',
      thumbnails: [
        { url: 'https://picsum.photos/seed/video-a-1/640/360', width: 640, height: 360 },
        { url: 'https://picsum.photos/seed/video-a-2/1280/720', width: 1280, height: 720 },
      ],
      streamingSources: [
        { type: 'hls', url: 'https://example.com/streams/midnight-drive.m3u8' },
        { type: 'mp4', url: 'https://example.com/streams/midnight-drive.mp4' },
      ],
      stats: { views: 12543, likes: 941 },
      publishedAt: new Date('2024-02-10T20:00:00Z'),
    },
    {
      id: ids.videoB,
      slug: 'sunrise-acoustic',
      title: 'Sunrise Acoustic',
      durationSeconds: 189,
      description: 'Warm guitars and soft vocals for morning coffee.',
      thumbnails: [
        { url: 'https://picsum.photos/seed/video-b-1/640/360', width: 640, height: 360 },
      ],
      streamingSources: [{ type: 'mp4', url: 'https://example.com/streams/sunrise-acoustic.mp4' }],
      stats: { views: 8432, likes: 622 },
      publishedAt: new Date('2024-03-01T10:30:00Z'),
    },
    {
      id: ids.videoC,
      slug: 'neon-city',
      title: 'Neon City',
      durationSeconds: 242,
      description: 'Synthwave energy and retro-futuristic vibes.',
      thumbnails: [
        { url: 'https://picsum.photos/seed/video-c-1/640/360', width: 640, height: 360 },
      ],
      streamingSources: [{ type: 'hls', url: 'https://example.com/streams/neon-city.m3u8' }],
      stats: { views: 22311, likes: 1870 },
      publishedAt: new Date('2024-04-15T18:00:00Z'),
    },
  ])
  .onConflictDoNothing()

await db
  .insert(videoArtists)
  .values([
    { videoId: ids.videoA, artistId: ids.artistB, role: 'primary', position: 0 },
    { videoId: ids.videoB, artistId: ids.artistA, role: 'primary', position: 0 },
    { videoId: ids.videoC, artistId: ids.artistC, role: 'primary', position: 0 },
  ])
  .onConflictDoNothing()

await db
  .insert(videoGenres)
  .values([
    { videoId: ids.videoA, genreId: ids.genreElectronic },
    { videoId: ids.videoB, genreId: ids.genreIndie },
    { videoId: ids.videoC, genreId: ids.genreElectronic },
    { videoId: ids.videoC, genreId: ids.genrePop },
  ])
  .onConflictDoNothing()

await db
  .insert(videoTags)
  .values([
    { videoId: ids.videoA, tagId: ids.tagWorkout },
    { videoId: ids.videoB, tagId: ids.tagAcoustic },
    { videoId: ids.videoC, tagId: ids.tagChill },
  ])
  .onConflictDoNothing()

await db
  .insert(lyricLines)
  .values([
    {
      id: '00000000-0000-0000-0000-000000010001',
      videoId: ids.videoA,
      timeMs: 0,
      language: 'en',
      text: 'Engines humming, streetlights blur',
    },
    {
      id: '00000000-0000-0000-0000-000000010002',
      videoId: ids.videoA,
      timeMs: 25000,
      language: 'en',
      text: 'Midnight drive, we disappear',
    },
    {
      id: '00000000-0000-0000-0000-000000010003',
      videoId: ids.videoB,
      timeMs: 0,
      language: 'en',
      text: 'Pour another cup, the sky turns gold',
    },
    {
      id: '00000000-0000-0000-0000-000000010004',
      videoId: ids.videoB,
      timeMs: 34000,
      language: 'en',
      text: 'Soft strings, a story untold',
    },
    {
      id: '00000000-0000-0000-0000-000000010005',
      videoId: ids.videoC,
      timeMs: 0,
      language: 'en',
      text: 'Neon city, hearts in chrome',
    },
    {
      id: '00000000-0000-0000-0000-000000010006',
      videoId: ids.videoC,
      timeMs: 41000,
      language: 'en',
      text: 'We run the night until we’re home',
    },
  ])
  .onConflictDoNothing()

await db
  .insert(playlists)
  .values({
    id: ids.playlistA,
    userId: ids.userA,
    title: 'Starter Playlist',
    description: 'A small set of seeded tracks for UI development.',
    isPublic: true,
  })
  .onConflictDoNothing()

await db
  .insert(playlistItems)
  .values([
    { playlistId: ids.playlistA, videoId: ids.videoA, position: 0 },
    { playlistId: ids.playlistA, videoId: ids.videoC, position: 1 },
    { playlistId: ids.playlistA, videoId: ids.videoB, position: 2 },
  ])
  .onConflictDoNothing()

await db
  .insert(favorites)
  .values({ userId: ids.userA, videoId: ids.videoC })
  .onConflictDoNothing()

await db
  .insert(watchlist)
  .values({ userId: ids.userA, videoId: ids.videoA })
  .onConflictDoNothing()

await db
  .insert(userActivity)
  .values([
    {
      userId: ids.userA,
      videoId: ids.videoA,
      activityType: 'watch',
      metadata: { progress: 0.35 },
    },
    {
      userId: ids.userA,
      videoId: ids.videoC,
      activityType: 'favorite',
      metadata: { source: 'seed' },
    },
    {
      userId: ids.userA,
      activityType: 'search',
      metadata: { query: 'neon' },
    },
  ])
  .onConflictDoNothing()

await db
  .insert(videoRelations)
  .values([
    { videoId: ids.videoA, relatedVideoId: ids.videoC, relationType: 'recommended', weight: 0.85 },
    { videoId: ids.videoC, relatedVideoId: ids.videoA, relationType: 'recommended', weight: 0.85 },
    { videoId: ids.videoB, relatedVideoId: ids.videoA, relationType: 'similar', weight: 0.4 },
  ])
  .onConflictDoNothing()

await pool.end()

console.log('Seed complete')
