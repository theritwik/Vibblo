/**
 * FriendRequest Model
 *
 * This model represents friend requests between users in the Vibblo application.
 * It tracks pending friend requests where one user sends a request to another.
 *
 * Schema Fields:
 * - sender: Reference to the User sending the friend request
 * - receiver: Reference to the User receiving the friend request
 *
 * Relationships:
 * - Many-to-One with User model (sender)
 * - Many-to-One with User model (receiver)
 *
 * Note: This model creates a many-to-many relationship between users
 * through a junction table that tracks pending friend requests.
 */

import mongoose, { Schema } from "mongoose";

const FriendRequestSchema = new Schema(
  {
    // Reference to the user sending the friend request
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to the user receiving the friend request
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const FriendRequest = mongoose.model(
  "FriendRequest",
  FriendRequestSchema
);
