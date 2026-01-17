import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { workSessionAPI } from "../utils/api";
import { getSocket } from "../utils/socket";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const WorkTimer = ({ selectedDate }) => {
  const partner = useSelector((state) => state.task.partner);

  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [partnerSeconds, setPartnerSeconds] = useState(0);
  const [partnerRunning, setPartnerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      const response = await workSessionAPI.getSession(selectedDate);
      if (response.data.success) {
        const session = response.data.data;
        setTotalSeconds(session.totalSeconds);
        setIsRunning(session.isRunning);
      }
    } catch {
      console.error("Failed to fetch session");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSession();

    // Fetch partner's timer if they exist
    if (partner?._id) {
      fetchPartnerSession();
    }
  }, [selectedDate, fetchSession, partner]);

  // Fetch partner's session
  const fetchPartnerSession = async () => {
    if (!partner?._id) return;
    try {
      const response = await workSessionAPI.getSession(selectedDate);
      if (response.data.success) {
        const session = response.data.data;
        setPartnerSeconds(session.totalSeconds);
        setPartnerRunning(session.isRunning);
      }
    } catch {
      console.error("Failed to fetch partner session");
    }
  };

  // Socket integration for real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePartnerTimerUpdate = ({ totalSeconds, isRunning }) => {
      setPartnerSeconds(totalSeconds);
      setPartnerRunning(isRunning);
    };

    socket.on("partner_timer_update", handlePartnerTimerUpdate);

    return () => {
      socket.off("partner_timer_update", handlePartnerTimerUpdate);
    };
  }, []);

  // Update timer every second when running
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = async () => {
    try {
      await workSessionAPI.startTimer(selectedDate);
      setIsRunning(true);
      toast.success("Timer started! ⏱️");

      // Emit to partner
      const socket = getSocket();
      if (socket && partner?._id) {
        socket.emit("timer_update", {
          partnerId: partner._id,
          totalSeconds: totalSeconds,
          isRunning: true,
        });
      }
    } catch {
      toast.error("Failed to start timer");
    }
  };

  const handlePause = async () => {
    try {
      await workSessionAPI.pauseTimer(selectedDate);
      setIsRunning(false);
      toast.success("Timer paused");

      // Emit to partner
      const socket = getSocket();
      if (socket && partner?._id) {
        socket.emit("timer_update", {
          partnerId: partner._id,
          totalSeconds: totalSeconds,
          isRunning: false,
        });
      }
    } catch {
      toast.error("Failed to pause timer");
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset today's timer?")) {
      try {
        await workSessionAPI.resetTimer(selectedDate);
        setTotalSeconds(0);
        setIsRunning(false);
        toast.success("Timer reset");
      } catch {
        toast.error("Failed to reset timer");
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 animate-pulse">
        <div className="h-20 bg-slate-700/50 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 md:gap-4">
      {/* Your Timer */}
      <div className="flex items-center gap-2.5 md:gap-3 bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/5 px-4 py-2.5">
        <Clock className="w-4 h-4 md:w-5 md:h-5 text-indigo-400 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-slate-400">You</span>
          <div
            className={`text-base md:text-xl font-mono font-bold ${
              isRunning ? "text-indigo-400" : "text-white"
            }`}
          >
            {formatTime(totalSeconds)}
          </div>
        </div>
        <div className="flex gap-1.5">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="p-1.5 md:p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
              title="Start"
            >
              <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="p-1.5 md:p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-all"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="p-1.5 md:p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      {/* Partner's Timer */}
      {partner && (
        <div className="flex items-center gap-2.5 md:gap-3 bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/5 px-4 py-2.5">
          <Clock className="w-4 h-4 md:w-5 md:h-5 text-pink-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs text-slate-400 truncate max-w-[80px]">
              {partner.name}
            </span>
            <div
              className={`text-base md:text-xl font-mono font-bold ${
                partnerRunning ? "text-pink-400" : "text-white/70"
              }`}
            >
              {formatTime(partnerSeconds)}
            </div>
          </div>
          {partnerRunning && (
            <span className="text-pink-400 animate-pulse text-sm md:text-base">
              ●
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkTimer;
