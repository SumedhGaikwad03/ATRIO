import { AnimatePresence, motion } from "framer-motion";


function TaskSidebar({
  show,
  setShowTasks,
  room,
  tasks,
  createTask,
  updateTask,
  deleteTask,
 
  isAdding,
  setIsAdding,
  taskProgress,
  completedTasks,
  totalTasks,
}) {
  

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => {}} // parent controls closing via setShowTasks
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.15)", backdropFilter: "blur(2px)", zIndex: 30 }}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="task-sidebar"
          >
            {/* Header */}
            <div className="sidebar-header">
             <div className="sidebar-title-row">
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div style={{ width: "3px", height: "22px", borderRadius: "99px", background: "linear-gradient(to bottom,#fbbf24,#f97316)" }} />
    <span className="sidebar-title">
      Tasks{room?.name ? ` · ${room.name}` : ""}
    </span>
    <span className="task-count-badge">
      {tasks.filter(t => !t.completed).length} left
    </span>
  </div>
  <button className="sidebar-close" onClick={() => setShowTasks(false)}>×</button>
</div>

              {/* Progress bar */}
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${taskProgress}%` }} />
              </div>
              <div className="progress-label">
                <span>{completedTasks} done</span>
                <span>{totalTasks} total</span>
              </div>
            </div>

            {/* Task list */}
            <div className="task-list">
              {[...tasks.filter(t => !t.completed), ...tasks.filter(t => t.completed)].map(task => (
                <div
                  key={task._id}
                  className="task-card"
                  style={{ opacity: task.completed ? 0.6 : 1 }}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    style={{ marginTop: "2px", accentColor: "#f97316", width: "15px", height: "15px", cursor: "pointer", flexShrink: 0 }}
                    onChange={async () => {
  if (task.isOptimistic) return;

  const updated = !task.completed;

  try {
    await updateTask(task._id, {
      completed: updated
    });
  } catch {
    // useTasks handles rollback
  }
}}
                  />
                  <div style={{ flex: 1, minWidth: 0, marginLeft: "10px" }}>
                    <p style={{
                      fontSize: "13px", fontWeight: 500, lineHeight: 1.4,
                      color: task.completed ? "#a8a29e" : "#1c1917",
                      textDecoration: task.completed ? "line-through" : "none",
                      marginBottom: "3px"
                    }}>
                      {task.text}
                    </p>
                    {task.createdBy?.username && (
                      <p style={{ fontSize: "10px", color: "#f97316", fontWeight: 500 }}>
                        {task.createdBy.username}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                     
                      if (task.isOptimistic) return;
                      try {
    await deleteTask(task._id);
  } catch {
    // useTasks handles rollback
  }
}}
                    style={{ marginLeft: "8px", width: "22px", height: "22px", borderRadius: "50%", border: "none", background: "transparent", color: "#d4c5b0", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s, color 0.15s" }}
                    onMouseEnter={e => { e.target.style.background = "#fee2e2"; e.target.style.color = "#dc2626"; }}
                    onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#d4c5b0"; }}
                  >×</button>
                </div>
              ))}

              {tasks.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#d4c5b0" }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: "0 auto 10px" }}>
                    <rect x="6" y="4" width="20" height="24" rx="4" stroke="#fde68a" strokeWidth="1.5"/>
                    <path d="M11 12h10M11 16h7M11 20h5" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="23" cy="23" r="5" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5"/>
                    <path d="M21 23l1.5 1.5L25 21" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p style={{ fontSize: "12px" }}>No tasks yet</p>
                </div>
              )}
            </div>

            {/* Add task */}
            <div style={{ padding: "12px 14px 18px", borderTop: "1px solid rgba(253,230,138,0.4)" }}>
              <input
                placeholder="Add a task and press Enter…"
                className="task-input"
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    if (isAdding) return;
                    setIsAdding(true);
                    const text = e.target.value.trim();
                    
                     try {
      await createTask(text);
    } catch {
      // useTasks already rolled back the optimistic task
    } finally {
      setIsAdding(false);
    }
  }
}}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TaskSidebar;