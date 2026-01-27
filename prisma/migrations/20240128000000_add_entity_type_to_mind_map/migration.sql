-- Add new columns with defaults for existing data
ALTER TABLE "mind_map_nodes" ADD COLUMN "entity_type" TEXT NOT NULL DEFAULT 'focus';
ALTER TABLE "mind_map_nodes" ADD COLUMN "entity_id" TEXT NOT NULL DEFAULT '';

-- Migrate existing data: copy focus_item_id to entity_id
UPDATE "mind_map_nodes" SET "entity_id" = "focus_item_id";

-- Remove the default now that data is migrated
ALTER TABLE "mind_map_nodes" ALTER COLUMN "entity_type" DROP DEFAULT;
ALTER TABLE "mind_map_nodes" ALTER COLUMN "entity_id" DROP DEFAULT;

-- Drop the old column and its index
DROP INDEX IF EXISTS "mind_map_nodes_focus_item_id_idx";
ALTER TABLE "mind_map_nodes" DROP COLUMN "focus_item_id";

-- Create new index
CREATE INDEX "mind_map_nodes_entity_type_entity_id_idx" ON "mind_map_nodes"("entity_type", "entity_id");
