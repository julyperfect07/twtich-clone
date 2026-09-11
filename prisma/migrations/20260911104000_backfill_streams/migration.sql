-- Existing Clerk users predate the Stream model. Give each one a stream so
-- creator and public channel pages work immediately after this migration.
INSERT INTO "Stream" ("id", "name", "userId", "createdAt", "updatedAt")
SELECT
  'stream_' || "User"."id",
  "User"."username" || '''s stream',
  "User"."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User"
WHERE NOT EXISTS (
  SELECT 1
  FROM "Stream"
  WHERE "Stream"."userId" = "User"."id"
);
