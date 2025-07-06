/**
 * Story Model
 *
 * This model represents user stories in the Vibblo application.
 * Stories are temporary content that automatically expire after 24 hours.
 * They can contain text content and/or images.
 *
 * Schema Fields:
 * - user: Reference to the User who created the story
 * - content: Text content of the story
 * - image: URL to an image in the story
 * - expiresAt: Automatic expiration date (24 hours from creation)
 *
 * Validations:
 * - Content: Max 100 characters
 *
 * Auto-expiration:
 * - Stories automatically expire 24 hours after creation
 * - The expiresAt field is set to current time + 24 hours by default
 *
 * Relationships:
 * - Many-to-One with User model
 */

import mongoose, { Schema } from "mongoose";

const StorySchema = new Schema(
  {
    // Reference to the user who created the story
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Text content of the story
    content: {
      type: String,
      maxLength: [100, "Story must be in length 100"],
    },
    // URL to an image in the story
    image: {
      type: String,
    },
    // Automatic expiration date (24 hours from creation)
    expiresAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000, // Expire in 24 hours
    },
  },
  { timestamps: true }
);

export const Story = mongoose.model("Story", StorySchema);
