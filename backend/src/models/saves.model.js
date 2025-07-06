/**
 * SavedItem Model
 *
 * This model represents saved posts by users in the Vibblo application.
 * It creates a many-to-many relationship between users and posts through
 * a junction table that tracks which posts each user has saved.
 *
 * Schema Fields:
 * - user: Reference to the User who saved the post
 * - post: Reference to the Post that was saved
 *
 * Relationships:
 * - Many-to-One with User model
 * - Many-to-One with Post model
 */

import mongoose, { Schema } from "mongoose";

const SavedItemSchema = new Schema({
  // Reference to the user who saved the post
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Reference to the post that was saved
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
});

export const SavedItem = mongoose.model("SavedItem", SavedItemSchema);
