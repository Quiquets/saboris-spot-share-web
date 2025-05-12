
// Export all services from this file for easy importing
export * from './types';
export * from './auth/authService';
export * from './user/userService';
export * from './social/followService';
export * from './places/restaurantService';

// Re-export supabaseService for backward compatibility
import { authService } from './auth/authService';
import { userService } from './user/userService';
import { followService } from './social/followService';
import { restaurantService } from './places/restaurantService';

// Create a facade for backward compatibility
export const supabaseService = {
  // Auth methods
  signIn: authService.signIn,
  signUp: authService.signUp,
  signInWithProvider: authService.signInWithProvider,
  signOut: authService.signOut,
  getCurrentUser: authService.getCurrentUser,
  getCurrentSession: authService.getCurrentSession,
  
  // User methods
  getUserProfile: userService.getUserProfile,
  updateUserProfile: userService.updateUserProfile,
  getUserSettings: userService.getUserSettings,
  updateUserSettings: userService.updateUserSettings,
  getProfileStats: userService.getProfileStats,
  searchUsers: userService.searchUsers,
  isFollowing: userService.isFollowing,
  
  // Follow methods
  getFollowers: followService.getFollowers,
  followUser: followService.followUser,
  unfollowUser: followService.unfollowUser,
  
  // Restaurant methods
  saveRestaurant: restaurantService.saveRestaurant,
  getSavedRestaurants: restaurantService.getSavedRestaurants,
  unsaveRestaurant: restaurantService.unsaveRestaurant
};
