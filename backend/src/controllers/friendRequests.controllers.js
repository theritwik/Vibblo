// friendRequest.controller.js
import mongoose from 'mongoose';
import { FriendRequest } from '../models/friendRequests.model.js';
import { User } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Send a friend request to another user
export const sendFriendRequest = asyncHandler(async (req, res, next) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  if (senderId === receiverId) {
    return next(new ApiError(400, 'You cannot send a friend request to yourself'));
  }

  // Check if a request already exists
  const existingRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
  if (existingRequest) {
    return next(new ApiError(400, 'Friend request already sent'));
  }

  // Create the friend request
  const friendRequest = await FriendRequest.create({ sender: senderId, receiver: receiverId });

  // Get sender name for notification
  const sender = await User.findById(senderId);
  
  // Create notification for receiver
  await Notification.create({
    senderUser: senderId,
    receiverUser: receiverId,
    message: `${sender.fullName} sent you a friend request`,
    navigateLink: `/profile/${senderId}`,
  });

  res.status(201).json(new ApiResponse(201, 'Friend request sent successfully', friendRequest));
});

// Accept a friend request
export const acceptFriendRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { requestId } = req.body;

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the request
    const friendRequest = await FriendRequest.findOne({ _id: requestId, receiver: userId }).session(session);
    if (!friendRequest) {
      throw new ApiError(404, 'Friend request not found');
    }

    // Add each other as friends atomically
    await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { $addToSet: { friends: friendRequest.sender } },
        { session }
      ),
      User.findByIdAndUpdate(
        friendRequest.sender,
        { $addToSet: { friends: userId } },
        { session }
      )
    ]);

    // Get recipient name for notification
    const recipient = await User.findById(userId).session(session);
    
    // Create notification
    await Notification.create([{
      senderUser: userId,
      receiverUser: friendRequest.sender,
      message: `${recipient.fullName} accepted your friend request`,
      navigateLink: `/profile/${userId}`,
    }], { session });

    // Delete all friend requests between these users in both directions
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, receiver: friendRequest.sender },
        { sender: friendRequest.sender, receiver: userId }
      ]
    }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json(new ApiResponse(200, 'Friend request accepted successfully'));
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// Reject or delete a friend request
export const rejectFriendRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { requestId } = req.body;

  // Find and delete the request
  const friendRequest = await FriendRequest.findOneAndDelete({ _id: requestId, receiver: userId });
  if (!friendRequest) {
    return next(new ApiError(404, 'Friend request not found'));
  }

  res.status(200).json(new ApiResponse(200, 'Friend request rejected successfully'));
});

// Get list of all requests sent by the user
export const getSentRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const sentRequests = await FriendRequest.find({ sender: userId }).populate('receiver', 'fullName username bio profilePicture coverImage');

  res.status(200).json(new ApiResponse(200, 'Sent friend requests fetched successfully', sentRequests));
});

// Get list of all requests received by the user
export const getReceivedRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const receivedRequests = await FriendRequest.find({ receiver: userId }).populate('sender', 'fullName username bio profilePicture coverImage');
  res.status(200).json(new ApiResponse(200, 'Received friend requests fetched successfully', receivedRequests));
});

// Get the list of all friends of the logged-in user
export const getFriendsList = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).populate('friends', 'fullName username bio profilePicture coverImage');
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.status(200).json(new ApiResponse(200, 'Friends list fetched successfully', user.friends));
});


// Cancel a sent friend request
export const cancelSentRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { requestId } = req.body;

  // Find and delete the sent friend request
  const friendRequest = await FriendRequest.findOneAndDelete({
    _id: requestId,
    sender: userId,
  });

  if (!friendRequest) {
    return next(new ApiError(404, 'Friend request not found or already cancelled'));
  }

  res.status(200).json(new ApiResponse(200, 'Friend request cancelled successfully'));
});


// Unfriend a friend
export const unfriend = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { friendId } = req.body;

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if both users exist
    const [user, friend] = await Promise.all([
      User.findById(userId).session(session),
      User.findById(friendId).session(session)
    ]);

    if (!user || !friend) {
      throw new ApiError(404, 'User or friend not found');
    }

    // Remove each other from friends lists atomically
    await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { $pull: { friends: friendId } },
        { session }
      ),
      User.findByIdAndUpdate(
        friendId,
        { $pull: { friends: userId } },
        { session }
      )
    ]);

    // Delete any pending friend requests between these users
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json(new ApiResponse(200, 'Friend removed successfully'));
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
