"use client";
import { useState, useEffect } from "react";
import { format, addDays, differenceInDays, parseISO } from "date-fns";

const constructionPhases = [
  { id: 1, name: "Site Investigation", duration: 7, dependencies: [] },
  { id: 2, name: "Design & Planning", duration: 14, dependencies: [1] },
  { id: 3, name: "Permitting", duration: 21, dependencies: [2] },
  { id: 4, name: "Site Preparation", duration: 10, dependencies: [3] },
  { id: 5, name: "Foundation Work", duration: 21, dependencies: [4] },
  { id: 6, name: "Structural Framing", duration: 28, dependencies: [5] },
  { id: 7, name: "Utilities Installation", duration: 21, dependencies: [6] },
  { id: 8, name: "Exterior Work", duration: 14, dependencies: [7] },
  { id: 9, name: "Interior Finishing", duration: 35, dependencies: [8] },
  { id: 10, name: "Final Inspection", duration: 7, dependencies: [9] },
];

export default function GanttChart({ project }) {
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    if (project?.startDate) {
      setStartDate(parseISO(project.startDate));
      generateGanttData(parseISO(project.startDate));
    }
  }, [project]);

  const generateGanttData = (projectStart) => {
    const generatedTasks = constructionPhases.map((phase) => {
      let start = projectStart;

      // Calculate start date based on dependencies
      if (phase.dependencies.length > 0) {
        const lastDependency = generatedTasks.find(
          (t) => t.id === phase.dependencies[phase.dependencies.length - 1]
        );
        if (lastDependency) {
          start = addDays(lastDependency.end, 1);
        }
      }

      const end = addDays(start, phase.duration - 1);

      return {
        ...phase,
        start,
        end,
        progress: Math.floor(Math.random() * 100), // Mock progress
      };
    });

    setTasks(generatedTasks);
  };

  const totalDuration = tasks.reduce((total, task) => {
    if (task.end > total) return task.end;
    return total;
  }, startDate);

  const totalDays = differenceInDays(totalDuration, startDate) + 1;

  const getDayHeaders = () => {
    const headers = [];
    for (let i = 0; i < totalDays; i += 7) {
      headers.push(addDays(startDate, i));
    }
    return headers;
  };

  const getTaskPosition = (task) => {
    const daysFromStart = differenceInDays(task.start, startDate);
    const taskDuration = differenceInDays(task.end, task.start) + 1;
    return {
      left: `${(daysFromStart / totalDays) * 100}%`,
      width: `${(taskDuration / totalDays) * 100}%`,
    };
  };

  if (!project) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Project Timeline
        </h3>
        <p className="text-gray-500">Select a project to view the timeline</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Project Timeline - {project.name}
        </h3>
        <div className="text-sm text-gray-500">
          {format(startDate, "MMM dd, yyyy")} -{" "}
          {format(totalDuration, "MMM dd, yyyy")}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-48 py-2 text-sm font-medium text-gray-500">
              Task Name
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {getDayHeaders().map((date, index) => (
                  <div
                    key={index}
                    className="flex-1 text-center py-2 text-xs text-gray-500 border-l border-gray-200"
                    style={{ minWidth: "50px" }}
                  >
                    {format(date, "MMM dd")}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-20 py-2 text-sm font-medium text-gray-500 text-center">
              Progress
            </div>
          </div>

          {/* Tasks */}
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => {
              const position = getTaskPosition(task);
              return (
                <div
                  key={task.id}
                  className="flex items-center py-3 hover:bg-gray-50"
                >
                  <div className="w-48 text-sm font-medium text-gray-900">
                    {task.name}
                  </div>
                  <div className="flex-1 relative h-8">
                    <div className="absolute inset-0 flex items-center">
                      <div
                        className="h-4 bg-blue-500 rounded relative"
                        style={{
                          left: position.left,
                          width: position.width,
                        }}
                      >
                        {/* Progress within task bar */}
                        <div
                          className="h-full bg-green-500 rounded-l"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center">
          <div className="w-4 h-3 bg-blue-500 rounded mr-2"></div>
          <span className="text-gray-600">Planned Duration</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-3 bg-gray-300 rounded mr-2"></div>
          <span className="text-gray-600">Remaining</span>
        </div>
      </div>
    </div>
  );
}
