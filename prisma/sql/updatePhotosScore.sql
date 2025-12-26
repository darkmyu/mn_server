-- @param {Float} $1:gravity
-- @param {Float} $2:score
UPDATE "photos"
SET "score" = (
  "likes" / 
  POWER(
    (EXTRACT(EPOCH FROM (NOW() - "created_at")) / 3600) + 2, 
    $1
  )
)
WHERE "score" > $2
RETURNING "id";