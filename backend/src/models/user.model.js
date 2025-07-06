/**
 * User Model
 *
 * This model represents user accounts in the Vibblo application.
 * It stores user profile information, authentication details, and social connections.
 *
 * Schema Fields:
 * - username: Unique username for the user account
 * - fullName: User's full name
 * - email: Unique email address for authentication
 * - password: Hashed password for security
 * - profilePicture: URL to user's profile picture
 * - coverImage: URL to user's cover image
 * - bio: User's biography/description
 * - isDpVerify: Profile picture verification status
 * - location: User's location
 * - dob: Date of birth with age validation
 * - friends: Array of user IDs representing friends
 *
 * Validations:
 * - Username: 3-30 characters, unique
 * - Email: Valid email format, unique, lowercase
 * - Password: Minimum 6 characters
 * - Age: Must be at least 13 years old
 * - Profile/Cover images: Valid URL format
 *
 * Relationships:
 * - Self-referencing friends array
 * - Referenced by Post, Comment, Story, SavedItem, FriendRequest, Notification models
 */

import mongoose, { Schema } from "mongoose";
import validator from "validator";

const UserSchema = new Schema(
  {
    // Unique username for the user account
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    // User's full name
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters long"],
      maxlength: [30, "Full name cannot exceed 100 characters"],
    },
    // Unique email address for authentication
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
    // Hashed password for security
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    // URL to user's profile picture with default avatar
    profilePicture: {
      type: String,
      default:
        "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg",
      validate: {
        validator: validator.isURL,
        message: "Invalid URL format for profile picture",
      },
    },
    // URL to user's cover image with default cover
    coverImage: {
      type: String,
      default: "https://ih1.redbubble.net/cover.4093136.2400x600.jpg",
      validate: {
        validator: validator.isURL,
        message: "Invalid URL format for cover image",
      },
    },
    // User's biography/description with default value
    bio: {
      type: String,
      maxlength: [100, "Bio cannot exceed 100 characters"],
      default: "✨ Crafting cool apps with MERN! 💻",
    },
    // Profile picture verification status
    isDpVerify: {
      type: Boolean,
      default: false,
    },
    // User's location
    location: {
      type: String,
      trim: true,
      maxlength: [30, "Location cannot exceed 100 characters"],
    },
    // Date of birth with age validation (minimum 13 years)
    dob: {
      type: Date,
      validate: {
        validator: function (value) {
          // Ensure the user is at least 13 years old
          const ageLimit = 13;
          const birthDate = new Date(value);
          const currentDate = new Date();
          const age = currentDate.getFullYear() - birthDate.getFullYear();
          return age >= ageLimit;
        },
        message: "You must be at least 13 years old",
      },
    },
    // Array of user IDs representing friends (self-referencing)
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
