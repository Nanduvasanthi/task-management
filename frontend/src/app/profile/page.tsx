"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  FaUser, FaEnvelope, FaCalendarAlt, FaKey, 
  FaSave, FaArrowLeft, FaCheckCircle, FaExclamationTriangle,
  FaSpinner, FaCamera, FaTrash, FaChartBar,
  FaShieldAlt, FaLock,
  FaEyeSlash,
  FaEye
} from "react-icons/fa";
import authService from "../../services/authService";
import userService from "../../services/userService";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activityStats, setActivityStats] = useState({
    tasksCreated: 0,
    tasksCompleted: 0,
    activeProjects: 0,
    teamMembers: 0
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Check authentication and load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        // Fetch user profile
        const profileResponse = await userService.getProfile();
        
        // Get user data from the correct response structure
        const userData = profileResponse.data?.user;  // ← Use 'profileResponse'r;
        
        if (userData) {
          setUser(userData);
          setFormData({
            name: userData.name,
            email: userData.email,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          
          // Generate avatar based on name
          if (userData.name) {
            setProfileImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4f46e5&color=fff&size=150`);
          }
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Fetch REAL activity stats from API
          try {
            const statsResponse = await userService.getActivityStats();
            const statsData = statsResponse.data || statsResponse;
            
            if (statsData) {
              setActivityStats({
                tasksCreated: statsData.tasksCreated || 0,
                tasksCompleted: statsData.tasksCompleted || 0,
                activeProjects: statsData.activeProjects || statsData.activeTasks || 0,
                teamMembers: statsData.teamMembers || 0
              });
            }
          } catch (statsErr) {
            console.log("Could not load activity stats:", statsErr);
            // Keep default zeros
          }
        } else {
          // Fallback to localStorage if API fails
          const localUser = authService.getCurrentUser();
          if (localUser) {
            setUser(localUser);
            setFormData({
              name: localUser.name,
              email: localUser.email,
              currentPassword: "",
              newPassword: "",
              confirmPassword: ""
            });
            
            if (localUser.name) {
              setProfileImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(localUser.name)}&background=4f46e5&color=fff&size=150`);
            }
          } else {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        // Fallback to localStorage
        const localUser = authService.getCurrentUser();
        if (localUser) {
          setUser(localUser);
          setFormData({
            name: localUser.name,
            email: localUser.email,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          
          if (localUser.name) {
            setProfileImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(localUser.name)}&background=4f46e5&color=fff&size=150`);
          }
        } else {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.newPassword && formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Prepare update data according to your backend controller
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError("Current password is required to set new password");
          setSaving(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Call real API to update profile
      const response = await userService.updateProfile(updateData);
      
      setSuccess("Profile updated successfully!");
      
      // Update state with response data
     const userData = response.data?.user;
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update avatar with new initials
        setProfileImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4f46e5&color=fff&size=150`);
      }
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      // Handle specific error messages from backend
      setError(err || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setSuccess("Profile picture updated locally!");
        // Note: You'll need to implement an API endpoint for image upload
        setTimeout(() => setSuccess(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (user?.name) {
      setProfileImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=150`);
      setSuccess("Profile picture reset to default!");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.deleteAccount();
      authService.logout();
      
      setSuccess("Your account has been deleted successfully. Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 2000);
      
    } catch (err: any) {
      setError(err || "Failed to delete account");
      setDeleting(false);
    }
  };

  // Activity stats data - replace with real data from your API
  const stats = [
    { 
      label: "Tasks Created", 
      value: activityStats.tasksCreated.toString(), 
      icon: "✓", 
      color: "bg-green-100 text-green-600" 
    },
    { 
      label: "Tasks Completed", 
      value: activityStats.tasksCompleted.toString(), 
      icon: "🏆", 
      color: "bg-blue-100 text-blue-600" 
    },
    { 
      label: "Active Tasks", 
      value: activityStats.activeProjects.toString(), 
      icon: "📊", 
      color: "bg-purple-100 text-purple-600" 
    },
    { 
      label: "Completion Rate",
      value: activityStats.tasksCreated > 0 ? `${Math.round((activityStats.tasksCompleted / activityStats.tasksCreated) * 100)}%` : "0%",
      icon: "📈", 
      color: "bg-yellow-100 text-yellow-600" 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="mr-4 p-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
              >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account and preferences</p>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="text-sm text-gray-500">Member since {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-sm">
              <div className="flex items-start">
                <FaExclamationTriangle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-2xl shadow-sm">
              <div className="flex items-start">
                <FaCheckCircle className="h-6 w-6 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card & Stats */}
            <div className="lg:col-span-1 space-y-8">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
                  
                  {/* Profile Image */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-2xl overflow-hidden">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt={user?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <FaUser className="w-16 h-16 text-blue-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Edit Image Button */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                            title="Upload photo"
                          >
                            <FaCamera className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={handleRemoveImage}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                            title="Remove photo"
                          >
                            <FaTrash className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="pt-20 pb-8 px-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                  <p className="text-gray-600 mb-4">{user?.email}</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} 
                  </span>
                </div>

                {/* Activity Overview Section */}
                <div className="border-t border-gray-200 px-6 py-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaChartBar className="w-5 h-5 mr-2 text-blue-600" />
                    Activity Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 rounded-xl bg-gray-50">
                        <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center text-xl font-bold mx-auto mb-2`}>
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {stat.value === "0" ? (
                            <span className="text-gray-400">--</span>
                          ) : (
                            stat.value
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  {activityStats.tasksCreated === 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700 text-center">
                        Activity data will appear here once you start using the app
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaShieldAlt className="w-5 h-5 mr-2 text-blue-600" />
                  Account Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-mono text-sm text-gray-900 bg-gray-50 p-2 rounded">{user?.id || user?._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Form */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                    <FaUser className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h2>
                  <p className="text-gray-600">Update your personal details and contact information</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Full Name
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FaLock className="w-5 h-5 mr-2 text-blue-600" />
                        Security Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              name="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              name="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="At least 6 characters"
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Confirm new password"
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={handleBackToDashboard}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
                        >
                          {saving ? (
                            <>
                              <FaSpinner className="animate-spin w-5 h-5 mr-2" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <FaSave className="w-5 h-5 mr-2" />
                              Save All Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Danger Zone - Only Delete Account */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-200">
                <div className="p-6 bg-red-50">
                  <h3 className="text-xl font-semibold text-red-800 mb-2 flex items-center">
                    <FaExclamationTriangle className="w-6 h-6 mr-2" />
                    Danger Zone
                  </h3>
                  <p className="text-red-700 mb-6">
                    This action is irreversible. Please proceed with caution.
                  </p>
                  
                  <div className="p-4 bg-white rounded-xl border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Delete Account</p>
                        <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Confirm Account Deletion</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <FaExclamationTriangle className="w-6 h-6 text-red-500 mr-2" />
                <p className="text-lg font-medium text-red-700">Warning: This action is irreversible!</p>
              </div>
              <p className="text-gray-600">
                This will permanently delete your account and all associated data including tasks, projects, and preferences. You will not be able to recover your account.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-70"
              >
                {deleting ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                    Deleting...
                  </span>
                ) : (
                  'Yes, Delete My Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}