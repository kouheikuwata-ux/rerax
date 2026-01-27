-- Add new columns with defaults for existing data
ALTER TABLE "mind_map_nodes" ADD COLUMN "node_type" TEXT NOT NULL DEFAULT 'mindMapNode';
ALTER TABLE "mind_map_nodes" ADD COLUMN "width" DOUBLE PRECISION;
ALTER TABLE "mind_map_nodes" ADD COLUMN "height" DOUBLE PRECISION;
