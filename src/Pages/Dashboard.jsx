import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Link as LinkIcon,
  Users,
  User,
  Heart,
  X,
  LayoutDashboard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bell,
  MessageCircle,
} from "lucide-react";
import { taskAPI, authAPI } from "../utils/api";
import { setTasks } from "../redux/slices/taskSlice";
import { logout, setUser } from "../redux/slices/authSlice";
import TaskPanel from "../components/TaskPanel";
import DateSlider from "../components/DateSlider";
import CommonGoals from "../components/CommonGoals";
import SenderNudgeAnimation from "../components/SenderNudgeAnimation";
import ReceiverNudgeAnimation from "../components/ReceiverNudgeAnimation";
import toast, { Toaster } from "react-hot-toast";
import { initSocket, disconnectSocket, getSocket } from "../utils/socket";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { myTasks, partnerTasks, partner, sharedTasks } = useSelector(
    (state) => state.task,
  );
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [showNudgeMenu, setShowNudgeMenu] = useState(false);
  const [nudgeSending, setNudgeSending] = useState(false);
  const [nudgeData, setNudgeData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Real-time Presence State
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Sidebar State
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isSidebarOpen = isPinned || isHovered;

  // Partner View State
  const [isPartnerViewActive, setIsPartnerViewActive] = useState(true);

  const handleNudgeComplete = useCallback(() => {
    setNudgeData(null);
  }, []);

  // Socket Connection Effect
  useEffect(() => {
    if (user && user._id) {
      const socket = initSocket(user._id, user.partnerId);

      socket.on("user_online", () => setIsPartnerOnline(true));
      socket.on("user_offline", () => setIsPartnerOnline(false));
      socket.on("partner_typing", () => setIsPartnerTyping(true));
      socket.on("partner_stop_typing", () => setIsPartnerTyping(false));

      return () => {
        socket.off("user_online");
        socket.off("user_offline");
        socket.off("partner_typing");
        socket.off("partner_stop_typing");
        disconnectSocket();
      };
    }
  }, [user]);

  // Handle Typing - Passed to TaskPanel
  const handleTyping = () => {
    const socket = getSocket();
    if (socket && user?.partnerId) {
      socket.emit("typing", { recipientId: user.partnerId });

      // Debounce stop typing
      if (window.typingTimeout) clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        socket.emit("stop_typing", { recipientId: user.partnerId });
      }, 1000);
    }
  };

  // Effect 1: Fetch User Profile ONCE on mount if missing
  useEffect(() => {
    if (!user) {
      authAPI
        .getProfile()
        .then((res) => {
          if (res.data.success) {
            dispatch(setUser(res.data.user));
          }
        })
        .catch(() => {
          console.log("Failed to fetch profile");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Effect 2: Fetch Dashboard Tasks when Date Changes
  useEffect(() => {
    fetchDashboard(true);
    const interval = setInterval(() => {
      // Silent refresh (no loading spinner)
      fetchDashboard(false);
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchDashboard = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      // Fetch Dashboard Data
      const response = await taskAPI.getDashboard(selectedDate);
      dispatch(
        setTasks({
          myTasks: response.data.data.myTasks,
          partnerTasks: response.data.data.partnerTasks,
          partner: response.data.data.partner,
          sharedTasks: response.data.data.sharedTasks,
        }),
      );

      // Also refresh user profile to get latest XP/Streak and check for nudges
      const profileRes = await authAPI.getProfile();
      if (profileRes.data.success) {
        const userData = profileRes.data.user;
        dispatch(setUser(userData));

        // Check for unseen nudge
        if (userData.lastNudge && !userData.lastNudge.seen) {
          // Trigger full-screen animation
          setNudgeData({
            message: userData.lastNudge.message,
            from: userData.lastNudge.from,
          });
          // Mark as seen
          await authAPI.markNudgeSeen();
        }
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
      toast.error("Failed to load dashboard. Check console.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logout());
      navigate("/");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const handleLinkPartner = async (e) => {
    e.preventDefault();
    try {
      await authAPI.linkPartner(partnerEmail);
      setShowLinkModal(false);
      setPartnerEmail("");
      toast.success("Partner linked successfully! 🎉");
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to link partner");
    }
  };

  const handleUnlinkPartner = async () => {
    if (!window.confirm("Are you sure you want to unlink your partner?"))
      return;
    try {
      await authAPI.unlinkPartner();
      toast.success("Partner unlinked successfully");
      fetchDashboard();
    } catch {
      toast.error("Failed to unlink partner");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      toast.success("Task deleted!");
      fetchDashboard();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleSendNudge = async (msg) => {
    setNudgeSending(true);
    try {
      await authAPI.sendNudge(msg);

      // Show animation for sender too!
      setNudgeData({
        message: msg,
        from: "You",
      });

      setShowNudgeMenu(false);
    } catch {
      toast.error("Failed to send nudge");
    } finally {
      setTimeout(() => setNudgeSending(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      {/* Nudge Animations */}
      {nudgeData && nudgeData.from === "You" && (
        <SenderNudgeAnimation
          message={nudgeData.message}
          onComplete={handleNudgeComplete}
        />
      )}
      {nudgeData && nudgeData.from !== "You" && (
        <ReceiverNudgeAnimation
          message={nudgeData.message}
          from={nudgeData.from}
          onComplete={handleNudgeComplete}
        />
      )}

      {/* Sidebar - Left Side */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col bg-slate-800/50 backdrop-blur-xl border-r border-white/5 p-4 relative z-50 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20 items-center"
        }`}
      >
        {/* Toggle/Pin Button */}
        <button
          onClick={() => setIsPinned(!isPinned)}
          className={`absolute -right-3 top-10 bg-indigo-600 rounded-full p-1 text-white shadow-lg border border-slate-900 hover:bg-indigo-700 transition-all duration-300 z-50 ${
            isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } ${isHovered ? "opacity-100" : ""}`}
          title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
        >
          {isPinned ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Logo */}
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            !isSidebarOpen ? "mb-6 justify-center w-full" : "mb-8 pl-2"
          }`}
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
            }`}
          >
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
              DuoTrack
            </h1>
          </div>
        </div>

        {/* User Info */}
        <div
          className={`transition-all duration-300 w-full overflow-hidden ${
            !isSidebarOpen
              ? "bg-transparent mb-4 flex justify-center"
              : "bg-slate-800/60 rounded-xl border border-white/5 p-3 mb-6"
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              !isSidebarOpen && "justify-center w-full"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
              <User className="w-5 h-5 text-slate-400" />
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
              }`}
            >
              <p className="text-sm font-semibold text-white truncate whitespace-nowrap">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 lowercase truncate whitespace-nowrap">
                {user?.email || "online"}
              </p>
            </div>
          </div>
        </div>

        {/* Gamification Stats - Hidden when collapsed */}
        <div
          className={`flex gap-2 transition-all duration-300 ${
            isSidebarOpen
              ? "opacity-100 mb-8 h-auto"
              : "opacity-0 h-0 overflow-hidden mb-0"
          }`}
        >
          <div className="flex-1 bg-orange-500/10 border border-orange-500/20 rounded-xl p-2 text-center whitespace-nowrap">
            <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-bold uppercase mb-1">
              <div className="w-3 h-3">🔥</div> Streak
            </div>
            <span className="text-white font-bold">{user?.streak || 0}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 space-y-2 w-full ${
            !isSidebarOpen && "flex flex-col items-center"
          }`}
        >
          {/* Dashboard Link - Active */}
          <button
            className={`flex items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 ${
              !isSidebarOpen
                ? "w-10 h-10 justify-center p-0"
                : "w-full gap-3 p-3"
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span
              className={`transition-all duration-300 ${
                isSidebarOpen
                  ? "opacity-100 w-auto"
                  : "opacity-0 w-0 overflow-hidden hidden"
              }`}
            >
              Dashboard
            </span>
          </button>
        </nav>

        {/* Footer Actions */}
        <div
          className={`space-y-2 w-full mt-auto ${
            !isSidebarOpen && "flex flex-col items-center gap-2 space-y-0"
          }`}
        >
          <button
            onClick={() => setShowLinkModal(true)}
            className={`flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all border border-transparent hover:border-white/5 ${
              !isSidebarOpen
                ? "w-10 h-10 justify-center p-0 bg-indigo-500/10 text-indigo-400"
                : "w-full"
            }`}
            title="Link Partner"
          >
            <LinkIcon className="w-5 h-5 shrink-0" />
            <span
              className={`transition-all duration-300 ${
                isSidebarOpen
                  ? "opacity-100 w-auto"
                  : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Link Partner
            </span>
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 ${
              !isSidebarOpen
                ? "w-10 h-10 justify-center p-0 bg-red-500/10"
                : "w-full bg-red-500/5"
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span
              className={`transition-all duration-300 ${
                isSidebarOpen
                  ? "opacity-100 w-auto"
                  : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header (Only visible on mobile) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">DuoTrack</h1>
          </div>
          <button onClick={handleLogout} className="text-slate-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
          {/* Background Gradients */}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
            <div className="absolute bottom-0 left-64 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] opacity-30" />
          </div>

          <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10 transition-all duration-300">
            {/* Header Section in Main Content (Date & Greeting) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                  Today's Overview
                </h2>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Date Slider */}
            <div className="mb-8">
              <DateSlider
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {/* Task Grid */}
            <div
              className={`grid grid-cols-1 ${
                isPartnerViewActive
                  ? "lg:grid-cols-2"
                  : "lg:grid-cols-[3fr_1fr]"
              } gap-4 md:gap-6 h-full transition-all duration-500`}
            >
              {/* Your Tasks */}
              <div className="flex flex-col h-full min-h-[400px] md:min-h-[500px] animate-slide-up">
                <div className="flex-1 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 p-1 flex flex-col">
                  <div className="flex-1 bg-slate-900/50 rounded-[22px] p-5 flex flex-col">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <User className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-white">
                          Your Tasks
                        </h3>
                        <p className="text-xs text-slate-400">Personal focus</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <TaskPanel
                        tasks={myTasks}
                        onUpdate={fetchDashboard}
                        onDelete={handleDeleteTask}
                        isPartner={false}
                        selectedDate={selectedDate}
                        onTyping={handleTyping}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner's Tasks */}
              <div
                className="flex flex-col h-full min-h-[500px] animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                {partner || partnerTasks.length > 0 ? (
                  <div className="flex-1 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 p-1 flex flex-col">
                    <div className="flex-1 bg-slate-900/50 rounded-[22px] p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30 shrink-0">
                            <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
                          </div>
                          <div
                            className={`transition-all duration-300 min-w-0 flex-1 ${
                              !isPartnerViewActive
                                ? "opacity-0 w-0 hidden"
                                : "opacity-100"
                            }`}
                          >
                            <h3 className="text-base md:text-lg font-bold text-white truncate flex items-center gap-1.5 md:gap-2">
                              <span className="truncate">
                                {partner
                                  ? `${partner.name}'s Tasks`
                                  : "Partner's Tasks"}
                              </span>
                              {isPartnerOnline && (
                                <span
                                  className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"
                                  title="Online"
                                />
                              )}
                              {partner?.streak > 0 && (
                                <span className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs bg-orange-500/20 border border-orange-500/30 px-1.5 md:px-2 py-0.5 rounded-full text-orange-400 shrink-0">
                                  🔥 {partner.streak}
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-slate-400 truncate h-4">
                              {isPartnerTyping ? (
                                <span className="text-indigo-400 animate-pulse font-medium">
                                  typing...
                                </span>
                              ) : (
                                "Partner's progress"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {partner && isPartnerViewActive && (
                            <>
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowNudgeMenu(!showNudgeMenu)
                                  }
                                  className={`text-indigo-400 hover:text-white hover:bg-indigo-500/20 p-2 rounded-lg transition-all ${
                                    nudgeSending
                                      ? "animate-pulse scale-110"
                                      : ""
                                  }`}
                                  title="Send Nudge"
                                  disabled={nudgeSending}
                                >
                                  <Bell className="w-5 h-5" />
                                </button>
                                {showNudgeMenu && (
                                  <div className="absolute right-0 top-10 bg-slate-800 border border-white/10 rounded-xl shadow-xl p-2 z-50 w-48 flex flex-col gap-1">
                                    <button
                                      onClick={() =>
                                        handleSendNudge("You got this! 🚀")
                                      }
                                      className="text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                      You got this! 🚀
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSendNudge("Wake up! ⏰")
                                      }
                                      className="text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                      Wake up! ⏰
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSendNudge("Great job! ⭐")
                                      }
                                      className="text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                      Great job! ⭐
                                    </button>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={handleUnlinkPartner}
                                className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              >
                                Unlink
                              </button>
                            </>
                          )}
                          <button
                            onClick={() =>
                              setIsPartnerViewActive(!isPartnerViewActive)
                            }
                            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all"
                            title={
                              isPartnerViewActive
                                ? "Shrink View"
                                : "Expand View"
                            }
                          >
                            {isPartnerViewActive ? (
                              <ChevronRight className="w-4 h-4" />
                            ) : (
                              <ChevronLeft className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <TaskPanel
                          tasks={partnerTasks}
                          onUpdate={fetchDashboard}
                          isPartner={true}
                          selectedDate={selectedDate}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-6 bg-slate-800/20 backdrop-blur-md rounded-3xl border border-white/5">
                    <div className="text-center max-w-sm w-full">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-dashed border-indigo-500/30 animate-pulse">
                        <LinkIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Connect Partner
                      </h3>
                      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        Link with your partner to see their tasks.
                      </p>
                      <button
                        onClick={() => setShowLinkModal(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all text-sm mb-4"
                      >
                        Link Partner
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Common Goals Section - Full Width */}
            {partner && sharedTasks && sharedTasks.length >= 0 && (
              <div
                className="mt-8 animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <CommonGoals
                  sharedTasks={sharedTasks}
                  onUpdate={fetchDashboard}
                  selectedDate={selectedDate}
                  partner={partner}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Link Partner Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 md:p-8 max-w-md w-full animate-scale-in shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Link Partner</h2>
                  <p className="text-xs text-slate-400">Connect instantly</p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkPartner}>
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value.toLowerCase())}
                placeholder="partner@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-900/50 text-white placeholder-slate-500 transition-all duration-300 outline-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold border border-white/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300"
                >
                  Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
