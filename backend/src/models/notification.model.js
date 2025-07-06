/**
 * Notification Model
 *
 * This model represents user notifications in the Vibblo application.
 * It tracks various types of notifications like friend requests, likes, comments, etc.
 * Notifications can be marked as read/unread and include navigation links.
 *
 * Schema Fields:
 * - senderUser: Reference to the User who triggered the notification
 * - receiverUser: Reference to the User receiving the notification
 * - navigateLink: URL or route to navigate when notification is clicked
 * - message: Text content of the notification
 * - isRead: Boolean flag indicating if the notification has been read
 *
 * Relationships:
 * - Many-to-One with User model (senderUser)
 * - Many-to-One with User model (receiverUser)
 *
 * Usage:
 * - Used for friend requests, post likes, comments, and other user interactions
 * - The navigateLink field allows direct navigation to relevant content
 * - isRead field helps track unread notifications for UI indicators
 */

// notification.model.js
import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    // Reference to the user who triggered the notification
    senderUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to the user receiving the notification
    receiverUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // URL or route to navigate when notification is clicked
    navigateLink: {
      type: String,
      required: true,
      default: "/",
    },
    // Text content of the notification
    message: {
      type: String,
      required: true,
    },
    // Boolean flag indicating if the notification has been read
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", NotificationSchema);
