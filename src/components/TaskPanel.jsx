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
  X,
  ListTodo,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { taskAPI } from "../utils/api";
import toast from "react-hot-toast";
import { Reorder } from "framer-motion";

const TaskCard = ({
  task,
  onUpdate,
  onDelete,
  isPartner = false,
  onTyping,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(task.isCompleted);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState("");

  // Sync local state with prop when it changes
  useEffect(() => {
    setLocalCompleted(task.isCompleted);
    setEditedContent(task.content);
  }, [task.isCompleted, task.content]);

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    try {
      await taskAPI.addSubtask(task._id, subtaskInput);
      setSubtaskInput("");
      onUpdate();
      toast.success("Subtask added");
    } catch {
      toast.error("Failed to add subtask");
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      await taskAPI.toggleSubtask(task._id, subtaskId);
      onUpdate();
    } catch {
      toast.error("Failed update");
    }
  };

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

  const handleSaveEdit = async () => {
    if (!editedContent.trim() || editedContent === task.content) {
      setIsEditing(false);
      setEditedContent(task.content);
      return;
    }

    try {
      await taskAPI.updateTask(task._id, { content: editedContent });
      setIsEditing(false);
      onUpdate();
      toast.success("Task updated!");
    } catch {
      toast.error("Failed to update task");
      setEditedContent(task.content);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(task.content);
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
      <div className="flex items-center gap-1.5 md:gap-3 p-2 md:p-3">
        {/* Drag Handle (Only for incomplete tasks) */}
        {!localCompleted && !isPartner && (
          <div className="cursor-grab active:cursor-grabbing text-white/50 hover:text-white/80 p-0.5 md:p-1 hidden md:block">
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Checkbox */}
        {!isPartner && (
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded border transition-all duration-200 flex items-center justify-center shadow-sm ${
              localCompleted
                ? "bg-white border-transparent"
                : `bg-transparent ${config.checkbox}`
            }`}
          >
            {localCompleted && (
              <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-900 font-bold" />
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="flex-1 px-2 py-1 text-sm bg-white/10 border border-white/30 rounded text-white outline-none focus:border-white/50"
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-300 transition-colors"
                title="Save (Enter)"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 transition-colors"
                title="Cancel (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 w-full">
              <span
                className={`text-xs md:text-sm font-medium text-white break-words flex-1 leading-tight md:leading-normal ${
                  localCompleted ? "line-through opacity-80" : ""
                }`}
                onDoubleClick={() => !isPartner && setIsEditing(true)}
                title="Double-click to edit"
              >
                {task.content}
              </span>
              {task.isRecurring && (
                <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/70 uppercase font-bold tracking-wide shrink-0">
                  <span className="text-xs">🔄</span>
                  {task.recurrence?.type}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subtask Toggle */}
        <button
          onClick={() => setShowSubtasks(!showSubtasks)}
          className={`p-1.5 rounded-md hover:bg-white/20 transition-all ${
            task.subtasks?.length > 0 ? "text-white" : "text-white/70"
          }`}
          title="Subtasks"
        >
          <div className="relative">
            <ListTodo className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {task.subtasks?.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-full">
                {task.subtasks.filter((t) => !t.isCompleted).length}
              </span>
            )}
          </div>
        </button>

        {/* Comment Toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`p-1.5 rounded-md hover:bg-white/20 transition-all ${
            task.comments?.length > 0 ? "text-white" : "text-white/70"
          }`}
          title="Comments"
        >
          <div className="relative">
            <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        )}
      </div>

      {/* Subtasks Section */}
      {showSubtasks && (
        <div className="px-3 pb-3 pt-2 border-t border-white/10 bg-black/10 animate-slide-up">
          <div className="space-y-1 mb-2">
            {task.subtasks?.map((subtask) => (
              <div
                key={subtask._id}
                className="flex items-center gap-2 text-sm group/sub"
              >
                {!isPartner && (
                  <button
                    onClick={() => handleToggleSubtask(subtask._id)}
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                      subtask.isCompleted
                        ? "bg-white/80 border-transparent"
                        : "border-white/30 hover:bg-white/10"
                    }`}
                  >
                    {subtask.isCompleted && (
                      <Check className="w-2.5 h-2.5 text-black" />
                    )}
                  </button>
                )}
                <span
                  className={`flex-1 text-white/90 break-all ${
                    subtask.isCompleted ? "line-through opacity-50" : ""
                  }`}
                >
                  {subtask.content}
                </span>
              </div>
            ))}
          </div>

          {!isPartner && (
            <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Add subtask..."
                className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-white/30 focus:border-white/30 outline-none"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}

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
              onChange={(e) => {
                setCommentText(e.target.value);
                if (onTyping) onTyping();
              }}
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
  onTyping,
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
      <div className="mb-3 md:mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5 truncate">
                {title}
              </h2>
            )}
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-[10px] md:text-xs font-medium text-slate-400">
                {completedCount}/{tasks.length} done
              </span>
              <div className="w-16 md:w-24 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
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
          className="flex flex-col gap-3 mb-4 animate-slide-up bg-slate-800/80 p-3 rounded-xl border border-white/10"
        >
          {/* Input & Category Row */}
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={newTask.content}
              onChange={(e) => {
                setNewTask({ ...newTask, content: e.target.value });
                if (onTyping) onTyping();
              }}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-white/10 focus:border-indigo-500/50 bg-slate-900/50 text-white placeholder-slate-500 outline-none transition-all"
              autoFocus
            />

            <div className="flex gap-2">
              <div className="relative group flex-1 md:flex-none">
                <select
                  value={newTask.category}
                  onChange={(e) =>
                    setNewTask({ ...newTask, category: e.target.value })
                  }
                  className="w-full md:w-12 h-10 opacity-0 absolute inset-0 cursor-pointer z-10"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Workout">Workout</option>
                  <option value="Study">Study</option>
                  <option value="Other">Other</option>
                </select>
                <div className="w-full md:w-12 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-slate-900/50 hover:bg-slate-800 transition-colors pointer-events-none">
                  {getCategoryIcon(newTask.category)}
                </div>
              </div>
            </div>
          </div>

          {/* Recurrence Options */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setNewTask((prev) => ({
                  ...prev,
                  isRecurring: !prev.isRecurring,
                  recurrence: prev.isRecurring ? null : { type: "daily" },
                }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                newTask.isRecurring
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "bg-slate-700/30 text-slate-400 border-transparent hover:bg-slate-700/50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${newTask.isRecurring ? "bg-indigo-400 animate-pulse" : "bg-slate-600"}`}
              />
              Repeat
            </button>

            {newTask.isRecurring && (
              <div className="flex flex-wrap items-center gap-2 animate-fade-in">
                {["daily", "weekly", "custom"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setNewTask((prev) => ({
                        ...prev,
                        recurrence: {
                          ...prev.recurrence,
                          type,
                          daysOfWeek: type === "custom" ? [] : undefined,
                        },
                      }))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      newTask.recurrence?.type === type
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-slate-700/50 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Days Selector */}
          {newTask.isRecurring && newTask.recurrence?.type === "custom" && (
            <div className="flex flex-wrap gap-1 pt-1 animate-slide-down">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                const isSelected = newTask.recurrence.daysOfWeek?.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const currentDays = newTask.recurrence.daysOfWeek || [];
                      const newDays = isSelected
                        ? currentDays.filter((d) => d !== idx)
                        : [...currentDays, idx].sort();

                      setNewTask((prev) => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, daysOfWeek: newDays },
                      }));
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 scale-105"
                        : "bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.99]"
          >
            Add Task {newTask.isRecurring && "🔄"}
          </button>
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
                      onTyping={onTyping}
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
                      onTyping={onTyping}
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
