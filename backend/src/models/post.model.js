import mongoose, {Schema} from "mongoose"

const PollOptionSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    maxLength: [100, 'Post cannot exceed 100 characters'],
    required: function() {
      return !this.image; // Content is required only if there's no image
    },
    validate: {
      validator: function(value) {
        // If content is provided (even if not required), it shouldn't be empty
        return !value || value.trim().length > 0;
      },
      message: 'Post content cannot be empty if provided'
    }
  },
  feeling: {
    type: String,
    maxLength: [50, 'Feeling cannot exceed 50 characters'],
  },
  image: {
    type: String,
    validate: {
      validator: function(v) {
        // Return true if empty or if it's a valid URL
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  backgroundColor: {
    type: String,
    default: 'bg-white',
    validate: {
      validator: function(value) {
        // Validate that it's a tailwind background color class
        return !value || /^bg-[a-z]+-[0-9]+$|^bg-white$|^bg-black$/.test(value);
      },
      message: 'Invalid background color format'
    }
  },
  poll: {
    options: {
      type: [PollOptionSchema],
      validate: {
        validator: function(options) {
          // If poll options are provided, must have at least 2 options
          return !options || options.length === 0 || options.length >= 2;
        },
        message: 'Poll must have at least 2 options if provided'
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(value) {
          // End date must be in the future
          return !value || value > new Date();
        },
        message: 'Poll end date must be in the future'
      }
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],

},{timestamps: true});

export const Post = mongoose.model('Post', PostSchema);
