/**
 * Comment Model
 *
 * This model represents comments on posts in the Vibblo application.
 * Users can comment on posts and like other users' comments.
 *
 * Schema Fields:
 * - post: Reference to the Post being commented on
 * - user: Reference to the User who made the comment
 * - content: Text content of the comment
 * - likes: Array of user IDs who liked the comment
 *
 * Validations:
 * - Content: Required, max 100 characters
 *
 * Relationships:
 * - Many-to-One with Post model
 * - Many-to-One with User model
 * - Many-to-Many with User model (likes)
 */

import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema(
  {
    // Reference to the post being commented on
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    // Reference to the user who made the comment
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Text content of the comment
    content: {
      type: String,
      required: true,
      maxLength: [100, "Comment cannot exceed 100 characters"],
    },
    // Array of user IDs who liked the comment
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", CommentSchema);
