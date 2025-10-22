import { Calendar } from "lucide-react";

const ProjectTimeline = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          No project data available
        </p>
      </div>
    );
  }

  const timelineData = data.map((phase, index) => ({
    id: phase.id,
    name: phase.name,
    startDate: new Date(phase.start),
    endDate: new Date(phase.end),
    duration: Math.max(
      1,
      (new Date(phase.end) - new Date(phase.start)) / (1000 * 60 * 60 * 24)
    ),
    progress: phase.progress || 0,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Generate distinct colors
  }));

  const minDate = new Date(
    Math.min(...timelineData.map((d) => d.startDate.getTime()))
  );
  const maxDate = new Date(
    Math.max(...timelineData.map((d) => d.endDate.getTime()))
  );

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full h-80 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-4 text-lg font-semibold dark:text-gray-400">
          Project Timeline{" "}
          <span className="flex items-center text-green-500">-----------</span>
        </h3>
        <div className="text-sm text-gray-500">
          {formatDate(minDate)} - {formatDate(maxDate)}
        </div>
      </div>

      <div className="relative h-64">
        {/* Timeline bars */}
        {timelineData.map((phase, index) => {
          const totalDuration = maxDate - minDate;
          const startPosition =
            ((phase.startDate - minDate) / totalDuration) * 100;
          const width =
            ((phase.endDate - phase.startDate) / totalDuration) * 100;

          return (
            <div key={phase.id} className="flex items-center mb-4 h-8">
              <div className="w-32 text-sm font-medium truncate mr-4">
                {phase.name}
              </div>
              <div className="flex-1 relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="absolute h-4 rounded-full"
                  style={{
                    left: `${startPosition}%`,
                    width: `${width}%`,
                    backgroundColor: phase.color,
                    opacity: 0.7,
                  }}
                />
                <div
                  className="absolute h-4 rounded-full"
                  style={{
                    left: `${startPosition}%`,
                    width: `${(width * phase.progress) / 100}%`,
                    backgroundColor: phase.color,
                  }}
                />
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full border"
                  style={{
                    left: `${startPosition + (width * phase.progress) / 100}%`,
                    borderColor: phase.color,
                  }}
                />
              </div>
              <div className="w-16 text-right text-sm text-gray-500 ml-4">
                {phase.progress}%
              </div>
            </div>
          );
        })}

        {/* Time scale */}
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
          <span>{formatDate(minDate)}</span>
          <span>{formatDate(maxDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
