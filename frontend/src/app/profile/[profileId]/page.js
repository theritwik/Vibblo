"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendFriendRequest,
  cancelSentRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
  fetchSentRequests,
  fetchReceivedRequests,
  fetchFriendsList,
} from '@/redux/friendRequests/friendRequestsSlice';
import { getAllPosts } from '@/redux/posts/postsSlice';
import AuthRedirect from '@/components/AuthRedirect';
import { FiHome, FiUser, FiList, FiAlertCircle, FiUserPlus } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai';
import { fetchUsers } from '@/redux/users/usersSlice';
import { motion } from 'framer-motion';
import ProfileInfo from '@/components/userProfile/ProfileInfo';
import FriendList from '@/components/userProfile/FriendList';
import Followers from '@/components/userProfile/Followers';
import Following from '@/components/userProfile/Following';
import Posts from '@/components/userProfile/Posts';
import Link from 'next/link';
import { Loading } from '@/components';

const UserProfile = ({ params }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('Profile');
  const [localStatus, setLocalStatus] = useState({
    isFriend: false,
    hasSentRequest: false,
    hasReceivedRequest: false
  });

  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);
  const users = useSelector((state) => state.users.users);
  const userPosts = posts.filter((post) => post.user._id === user?._id);
  const loggedInUserId = useSelector((state) => state.auth.userDetails?._id);
  
  const friendsList = useSelector((state) => state.friendRequests.friendsList);
  const sentRequests = useSelector((state) => state.friendRequests.sentRequests);
  const receivedRequests = useSelector((state) => state.friendRequests.receivedRequests);
  
  const sentRequestId = sentRequests.find((req) => req.receiver?._id === user?._id)?._id;
  const receivedRequestId = receivedRequests.find((req) => req.sender?._id === user?._id)?._id;

  // Update local status whenever Redux state changes
  useEffect(() => {
    if (user) {
      setLocalStatus({
        isFriend: friendsList.some(friend => friend._id === user._id),
        hasSentRequest: sentRequests.some(req => req.receiver._id === user._id),
        hasReceivedRequest: receivedRequests.some(req => req.sender._id === user._id)
      });
    }
  }, [friendsList, sentRequests, receivedRequests, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/user/userDetails/${params.profileId}`),
          dispatch(getAllPosts()),
          dispatch(fetchUsers()),
          dispatch(fetchSentRequests()),
          dispatch(fetchReceivedRequests()),
          dispatch(fetchFriendsList())
        ]);
        setUser(userResponse.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user details');
        setLoading(false);
      }
    };
    fetchData();
  }, [params.profileId, dispatch]);

  const refreshAllData = async () => {
    try {
      const [userResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/user/userDetails/${params.profileId}`),
        dispatch(fetchSentRequests()),
        dispatch(fetchReceivedRequests()),
        dispatch(fetchFriendsList())
      ]);
      setUser(userResponse.data.data);
    } catch (err) {
      setError('Failed to refresh data');
    }
  };

  const handleSendRequest = async () => {
    try {
      setLocalStatus(prev => ({ ...prev, hasSentRequest: true }));
      await dispatch(sendFriendRequest(user._id));
      await refreshAllData();
    } catch (err) {
      setLocalStatus(prev => ({ ...prev, hasSentRequest: false }));
      setError('Failed to send friend request');
    }
  };

  const handleCancelRequest = async () => {
    try {
      setLocalStatus(prev => ({ ...prev, hasSentRequest: false }));
      await dispatch(cancelSentRequest(sentRequestId));
      await refreshAllData();
    } catch (err) {
      setLocalStatus(prev => ({ ...prev, hasSentRequest: true }));
      setError('Failed to cancel request');
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setLocalStatus({
        isFriend: true,
        hasSentRequest: false,
        hasReceivedRequest: false
      });
      await dispatch(acceptFriendRequest(receivedRequestId));
      await refreshAllData();
    } catch (err) {
      setLocalStatus(prev => ({
        ...prev,
        isFriend: false,
        hasReceivedRequest: true
      }));
      setError('Failed to accept request');
    }
  };

  const handleRejectRequest = async () => {
    try {
      setLocalStatus(prev => ({ ...prev, hasReceivedRequest: false }));
      await dispatch(rejectFriendRequest(receivedRequestId));
      await refreshAllData();
    } catch (err) {
      setLocalStatus(prev => ({ ...prev, hasReceivedRequest: true }));
      setError('Failed to reject request');
    }
  };

  const handleUnfriend = async () => {
    try {
      setLocalStatus({ isFriend: false, hasSentRequest: false, hasReceivedRequest: false });
      await dispatch(unfriend(user._id));
      await refreshAllData();
    } catch (err) {
      setLocalStatus(prev => ({ ...prev, isFriend: true }));
      setError('Failed to unfriend');
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-red-500">{error}</p>;

  const renderFriendshipButton = () => {
    if (localStatus.isFriend) {
      return (
        <button
          className="px-3 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          onClick={handleUnfriend}
        >
          Unfriend
        </button>
      );
    }

    if (localStatus.hasReceivedRequest) {
      return (
        <>
          <button
            className="px-3 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
            onClick={handleAcceptRequest}
          >
            Accept
          </button>
          <button
            className="px-3 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
            onClick={handleRejectRequest}
          >
            Reject
          </button>
        </>
      );
    }

    if (localStatus.hasSentRequest) {
      return (
        <button
          className="px-3 sm:px-4 py-1 sm:py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-300"
          onClick={handleCancelRequest}
        >
          Cancel Request
        </button>
      );
    }

    return (
      <button
        className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        onClick={handleSendRequest}
      >
        Add Friend
      </button>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'Profile':
        return <Posts userPosts={userPosts} loggedInUserId={loggedInUserId} user={user} usersList={users} />;
      case 'Profile Info':
        return <ProfileInfo user={user} />;
      case 'Friend List':
        return <FriendList users={users} user={user} />;
      case 'Followers':
        return <Followers users={users} user={user} />;
      case 'Following':
        return <Following users={users} user={user} />;
      case 'Posts':
        return <Posts userPosts={userPosts} loggedInUserId={loggedInUserId} user={user} usersList={false} />;
      default:
        return null;
    }
  };

  return (
    <AuthRedirect>
      <div className="min-h-screen bg-[#F5F6FA] flex justify-center p-3">
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-md overflow-hidden">
          <motion.div
            className="relative h-60 sm:h-80 bg-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={user.coverImage || "https://via.placeholder.com/150"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {loggedInUserId === user._id && (
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Link href="/settings" className="px-2 sm:px-4 py-1 sm:py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition duration-300">
                  Edit Cover Image
                </Link>
                <Link href="/settings" className="px-2 sm:px-4 py-1 sm:py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition duration-300">
                  Edit Profile Picture
                </Link>
              </div>
            )}
          </motion.div>

          <motion.div className="relative px-4 pt-12 pb-6 flex flex-col sm:flex-row items-center sm:items-start sm:pb-12">
            <div className="absolute -top-16 sm:-top-24 left-6">
              <img
                src={user.profilePicture || "https://via.placeholder.com/150"}
                alt={user.fullName}
                className="w-36 h-36 sm:w-52 sm:h-52 rounded-full border-4 border-white shadow-lg hover:scale-105 transition-transform object-cover"
              />
            </div>
            
            <div className="ml-0 sm:ml-56 mt-4 sm:mt-0 mr-4 sm:mr-7 flex-1">
              <div className="ml-2 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl HelvB capitalize">{user.fullName}</h1>
                <h1 className="text-sm sm:text-lg HelvR">@{user.username}</h1>
                <p className="text-sm sm:text-base HelvR text-gray-800">{user.bio}</p>
                <p className="text-sm sm:text-base text-gray-700 HelvR">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-x-2 mt-4 sm:mt-0">
              {loggedInUserId === user._id ? (
                <button className="px-3 sm:px-4 py-1 sm:py-2 bg-indigo-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
                  Your Profile
                </button>
              ) : (
                renderFriendshipButton()
              )}
            </div>
          </motion.div>

          <nav className="border-b border-gray-200 mt-2">
            <ul className="flex flex-wrap justify-center sm:justify-start space-x-0 sm:space-x-4">
              {menuItems.map((item) => (
                <li key={item.label} className="relative group">
                  <button
                    className={`flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-t-lg transition duration-300 ${
                      activeSection === item.label
                        ? 'bg-[#F6F8FF] text-blue-700 border-b-2 border-blue-500'
                        : 'hover:bg-[#F6F8FF] hover:text-blue-700 hover:border-b-2 hover:border-blue-500'
                    }`}
                    onClick={() => setActiveSection(item.label)}
                  >
                    {item.icon}
                    <span className="ml-2 sm:ml-4">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div>{renderSection()}</div>
        </div>
      </div>
    </AuthRedirect>
  );
};

const menuItems = [
  { label: 'Profile', icon: <FiHome className="w-6 h-6 text-blue-500" /> },
  { label: 'Profile Info', icon: <FiUser className="w-6 h-6 text-green-500" /> },
  { label: 'Friend List', icon: <FiList className="w-6 h-6 text-orange-500" /> },
  { label: 'Followers', icon: <FiAlertCircle className="w-6 h-6 text-yellow-500" /> },
  { label: 'Following', icon: <AiOutlineFileText className="w-6 h-6 text-teal-500" /> },
  { label: 'Posts', icon: <FiUserPlus className="w-6 h-6 text-pink-500" /> }
];

export default UserProfile;
