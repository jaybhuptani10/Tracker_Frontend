import React, { useState, useEffect } from "react";
import {
  Check,
  Plus,
  Trash2,
  Briefcase,
  Home,
  Dumbbell,
  BookOpen,
  Layers,
  GripVertical,
  MessageCircle,
} from "lucide-react";
import { taskAPI } from "../utils/api";
import toast from "react-hot-toast";
import { Reorder } from "framer-motion";

const TaskCard = ({ task, onUpdate, onDelete, isPartner = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(task.isCompleted);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Sync local state with prop when it changes
  useEffect(() => {
    setLocalCompleted(task.isCompleted);
  }, [task.isCompleted]);

  const handleToggle = async () => {
    if (isPartner || isUpdating) return;

    // Optimistic Update
    const newStatus = !localCompleted;
    setLocalCompleted(newStatus);
    setIsUpdating(true);

    try {
      await taskAPI.updateTaskStatus(task._id, newStatus);
      onUpdate();
      toast.success(newStatus ? "Task completed! 🎉" : "Task reopened!");
    } catch {
      // Revert on error
      setLocalCompleted(!newStatus);
      toast.error("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await taskAPI.addComment(task._id, commentText);
      setCommentText("");
      onUpdate();
      toast.success("Message sent! 💬");
    } catch {
      toast.error("Failed to add message");
    }
  };

  const categoryConfig = {
    // Exact same colors as user loved
    Work: {
      icon: Briefcase,
      cardBg: "bg-gradient-to-r from-blue-600 to-blue-500",
      border: "border-blue-400/30",
      checkbox: "border-blue-200 hover:bg-blue-700",
      iconBg: "bg-blue-700/30 text-blue-100",
    },
    Personal: {
      icon: Home,
      cardBg: "bg-gradient-to-r from-purple-600 to-purple-500",
      border: "border-purple-400/30",
      checkbox: "border-purple-200 hover:bg-purple-700",
      iconBg: "bg-purple-700/30 text-purple-100",
    },
    Workout: {
      icon: Dumbbell,
      cardBg: "bg-gradient-to-r from-orange-600 to-orange-500",
      border: "border-orange-400/30",
      checkbox: "border-orange-200 hover:bg-orange-700",
      iconBg: "bg-orange-700/30 text-orange-100",
    },
    Study: {
      icon: BookOpen,
      cardBg: "bg-gradient-to-r from-green-600 to-green-500",
      border: "border-green-400/30",
      checkbox: "border-green-200 hover:bg-green-700",
      iconBg: "bg-green-700/30 text-green-100",
    },
    Other: {
      icon: Layers,
      cardBg: "bg-gradient-to-r from-slate-600 to-slate-500",
      border: "border-slate-400/30",
      checkbox: "border-slate-200 hover:bg-slate-700",
      iconBg: "bg-slate-700/30 text-slate-100",
    },
  };

  const config = categoryConfig[task.category] || categoryConfig.Other;
  const Icon = config.icon;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col rounded-lg border shadow-lg transition-all duration-200 hover:shadow-xl ${
        config.cardBg
      } ${config.border} ${
        localCompleted ? "opacity-60 saturate-50" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle (Only for incomplete tasks) */}
        {!localCompleted && !isPartner && (
          <div className="cursor-grab active:cursor-grabbing text-white/50 hover:text-white/80">
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Checkbox */}
        {!isPartner && (
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`flex-shrink-0 w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center shadow-sm ${
              localCompleted
                ? "bg-white border-transparent"
                : `bg-transparent ${config.checkbox}`
            }`}
          >
            {localCompleted && (
              <Check className="w-3.5 h-3.5 text-slate-900 font-bold" />
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span
            className={`text-sm font-medium truncate text-white ${
              localCompleted ? "line-through opacity-80" : ""
            }`}
          >
            {task.content}
          </span>
        </div>

        {/* Comment Toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`p-1.5 rounded-md hover:bg-white/20 transition-all ${
            task.comments?.length > 0 ? "text-white" : "text-white/70"
          }`}
          title="Comments"
        >
          <div className="relative">
            <MessageCircle className="w-3.5 h-3.5" />
            {task.comments?.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full">
                {task.comments.length}
              </span>
            )}
          </div>
        </button>

        {/* Category Icon */}
        <div
          className={`p-1.5 rounded-md ${config.iconBg} backdrop-blur-sm`}
          title={task.category}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>

        {/* Delete Button */}
        {!isPartner && (
          <button
            onClick={() => onDelete(task._id)}
            className={`p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 ${
              isHovered
                ? "opacity-100"
                : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="p-3 border-t border-white/10 bg-black/20 rounded-b-lg animate-slide-up">
          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto scrollbar-hide">
            {task.comments?.length === 0 ? (
              <p className="text-xs text-white/50 text-center italic">
                No notes yet
              </p>
            ) : (
              task.comments?.map((comment, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg p-2 text-xs text-white"
                >
                  <p>{comment.text}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type a note..."
              className="flex-1 px-2 py-1.5 rounded bg-white/10 border border-white/10 text-xs text-white placeholder-white/50 focus:border-white/30 outline-none"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-2 py-1.5 bg-white/20 hover:bg-white/30 rounded text-white disabled:opacity-50 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const TaskPanel = ({
  title,
  tasks,
  onUpdate,
  onDelete,
  isPartner,
  selectedDate,
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ content: "", category: "Other" });

  const completedTasks = tasks.filter((t) => t.isCompleted);
  // We need to keep a local state for dragging active tasks
  const [activeTasks, setActiveTasks] = useState([]);

  // Sync effect: When `tasks` prop updates (e.g., loaded from DB), update our list
  // Careful not to overwrite drag state while dragging, but simpler to just sync for now
  useEffect(() => {
    setActiveTasks(tasks.filter((t) => !t.isCompleted));
  }, [tasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.content.trim()) return;

    try {
      await taskAPI.createTask({ ...newTask, date: selectedDate });
      setNewTask({ content: "", category: "Other" });
      setShowAddTask(false);
      onUpdate();
      toast.success("Task added! 🚀");
    } catch {
      toast.error("Failed to add task");
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Work":
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case "Personal":
        return <Home className="w-4 h-4 text-purple-400" />;
      case "Workout":
        return <Dumbbell className="w-4 h-4 text-orange-400" />;
      case "Study":
        return <BookOpen className="w-4 h-4 text-green-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-white mb-0.5">{title}</h2>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">
                {completedCount}/{tasks.length} done
              </span>
              <div className="w-24 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {!isPartner && (
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Add Task Input */}
      {showAddTask && !isPartner && (
        <form
          onSubmit={handleAddTask}
          className="flex flex-col md:flex-row gap-2 mb-3 animate-slide-up"
        >
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newTask.content}
              onChange={(e) =>
                setNewTask({ ...newTask, content: e.target.value })
              }
              placeholder="New task..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-white/10 focus:border-indigo-500/50 bg-slate-900/50 text-white placeholder-slate-500 outline-none transition-all w-full"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <div className="relative group flex-1 md:flex-none">
              <select
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value })
                }
                className="w-full md:w-10 h-10 opacity-0 absolute inset-0 cursor-pointer z-10"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Workout">Workout</option>
                <option value="Study">Study</option>
                <option value="Other">Other</option>
              </select>
              <div className="w-full md:w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-slate-900/50 hover:bg-slate-800 transition-colors pointer-events-none">
                {getCategoryIcon(newTask.category)}
              </div>
            </div>
            <button
              type="submit"
              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {tasks.length === 0 ? (
          <div className="text-center py-8 opacity-50">
            <p className="text-sm text-slate-400">No tasks for today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* 1. Active Tasks (Draggable) */}
            {activeTasks.length > 0 && (
              <Reorder.Group
                axis="y"
                values={activeTasks}
                onReorder={setActiveTasks}
                className="space-y-2"
              >
                {activeTasks.map((task) => (
                  <Reorder.Item
                    key={task._id}
                    value={task}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard
                      task={task}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      isPartner={isPartner}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {/* 2. Completed Tasks (Static) */}
            {completedTasks.length > 0 && (
              <>
                {activeTasks.length > 0 && (
                  <div className="border-t border-white/10 my-2 pt-2">
                    <p className="text-xs text-slate-500 mb-2 px-1 uppercase font-semibold tracking-wider">
                      Completed
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      isPartner={isPartner}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPanel;
