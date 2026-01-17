// Add this import at the top of Dashboard.jsx with other component imports
import CommonGoals from "../components/CommonGoals";

// Add this code after line 674 (after the task grid closing div, before the main content area closing div)

            {/* Common Goals Section - Full Width */}
            {partner && sharedTasks && (
              <div className="mt-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <CommonGoals
                  sharedTasks={sharedTasks}
                  onUpdate={fetchDashboard}
                  selectedDate={selectedDate}
                  partner={partner}
                />
              </div>
            )}
