/**
 * Post Model
 *
 * This model represents user posts in the Vibblo application.
 * It supports various types of content including text, images, polls, and feelings.
 * Posts can have different background colors and support user interactions like likes.
 *
 * Schema Fields:
 * - user: Reference to the User who created the post
 * - content: Text content of the post (optional if image is provided)
 * - feeling: User's current feeling/mood
 * - image: URL to an image attached to the post
 * - backgroundColor: Tailwind CSS background color class
 * - poll: Poll object with options, end date, and active status
 * - likes: Array of user IDs who liked the post
 *
 * Sub-schemas:
 * - PollOptionSchema: Individual poll option with text and votes
 *
 * Validations:
 * - Content: Required if no image, max 100 characters, cannot be empty if provided
 * - Image: Valid URL format if provided
 * - Background color: Valid Tailwind CSS class format
 * - Poll: Must have at least 2 options if provided, end date must be in future
 *
 * Relationships:
 * - Many-to-One with User model
 * - One-to-Many with Comment model
 * - Many-to-Many with User model (likes)
 * - Referenced by SavedItem model
 */

import mongoose, { Schema } from "mongoose";

// Sub-schema for poll options
const PollOptionSchema = new Schema({
  // Text content of the poll option
  text: {
    type: String,
    required: true,
    trim: true,
  },
  // Array of user IDs who voted for this option
  votes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const PostSchema = new Schema(
  {
    // Reference to the user who created the post
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Text content of the post (optional if image is provided)
    content: {
      type: String,
      maxLength: [100, "Post cannot exceed 100 characters"],
      required: function () {
        return !this.image; // Content is required only if there's no image
      },
      validate: {
        validator: function (value) {
          // If content is provided (even if not required), it shouldn't be empty
          return !value || value.trim().length > 0;
        },
        message: "Post content cannot be empty if provided",
      },
    },
    // User's current feeling/mood
    feeling: {
      type: String,
      maxLength: [50, "Feeling cannot exceed 50 characters"],
    },
    // URL to an image attached to the post
    image: {
      type: String,
      validate: {
        validator: function (v) {
          // Return true if empty or if it's a valid URL
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid image URL",
      },
    },
    // Tailwind CSS background color class for the post
    backgroundColor: {
      type: String,
      default: "bg-white",
      validate: {
        validator: function (value) {
          // Validate that it's a tailwind background color class
          return (
            !value || /^bg-[a-z]+-[0-9]+$|^bg-white$|^bg-black$/.test(value)
          );
        },
        message: "Invalid background color format",
      },
    },
    // Poll object with options, end date, and active status
    poll: {
      // Array of poll options with text and votes
      options: {
        type: [PollOptionSchema],
        validate: {
          validator: function (options) {
            // If poll options are provided, must have at least 2 options
            return !options || options.length === 0 || options.length >= 2;
          },
          message: "Poll must have at least 2 options if provided",
        },
      },
      // End date for the poll (must be in the future)
      endDate: {
        type: Date,
        validate: {
          validator: function (value) {
            // End date must be in the future
            return !value || value > new Date();
          },
          message: "Poll end date must be in the future",
        },
      },
      // Whether the poll is currently active
      active: {
        type: Boolean,
        default: true,
      },
    },
    // Array of user IDs who liked the post
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);
