import React, { useState } from "react";
import { Users, Plus, Check, Trash2, X } from "lucide-react";
import { taskAPI } from "../utils/api";
import toast from "react-hot-toast";

const CommonGoals = ({ sharedTasks, onUpdate, selectedDate, partner }) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState("");

  const handleAddSharedTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await taskAPI.createTask({
        content: newTask,
        category: "Other",
        date: selectedDate,
        isShared: true,
      });
      setNewTask("");
      setShowAddTask(false);
      onUpdate();
      toast.success("Common goal added! 🎯");
    } catch {
      toast.error("Failed to add common goal");
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await taskAPI.updateTaskStatus(taskId, !currentStatus);
      onUpdate();
      toast.success(!currentStatus ? "Goal completed! 🎉" : "Goal reopened!");
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      onUpdate();
      toast.success("Goal removed!");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  const completedCount = sharedTasks.filter((t) => t.isCompleted).length;
  const progress =
    sharedTasks.length > 0 ? (completedCount / sharedTasks.length) * 100 : 0;

  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/5 p-1">
      <div className="bg-slate-900/50 rounded-[22px] p-3 md:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">
                Common Goals
              </h3>
              <p className="text-xs text-slate-400">
                Shared with {partner?.name || "partner"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium text-slate-400">
            {completedCount}/{sharedTasks.length} done
          </span>
          <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <form
            onSubmit={handleAddSharedTask}
            className="mb-4 animate-slide-up"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a common goal..."
                className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-white/10 focus:border-emerald-500/50 bg-slate-900/50 text-white placeholder-slate-500 outline-none transition-all"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </form>
        )}

        {/* Tasks List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {sharedTasks.length === 0 ? (
            <div className="text-center py-8 opacity-50">
              <p className="text-sm text-slate-400">No common goals yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Add goals you both want to achieve!
              </p>
            </div>
          ) : (
            sharedTasks.map((task) => (
              <div
                key={task._id}
                className={`group flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg border transition-all duration-200 hover:shadow-xl ${
                  task.isCompleted
                    ? "bg-gradient-to-r from-emerald-600/40 to-teal-600/40 border-emerald-400/30 opacity-60"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/30"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(task._id, task.isCompleted)}
                  className={`flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded border transition-all duration-200 flex items-center justify-center shadow-sm ${
                    task.isCompleted
                      ? "bg-white border-transparent"
                      : "bg-transparent border-emerald-200 hover:bg-emerald-700"
                  }`}
                >
                  {task.isCompleted && (
                    <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-900 font-bold" />
                  )}
                </button>

                {/* Content */}
                <span
                  className={`flex-1 text-xs md:text-sm font-medium text-white break-words leading-tight md:leading-normal ${
                    task.isCompleted ? "line-through opacity-80" : ""
                  }`}
                >
                  {task.content}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonGoals;
