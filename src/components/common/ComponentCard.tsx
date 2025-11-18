import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: React.ReactNode; // Description text
  json?: React.ReactNode;
  text?: React.ReactNode;
  video?: React.ReactNode;
  resume?: React.ReactNode;
  delete_track?: React.ReactNode;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc,
  json,
  text,
  video,
  resume,
  delete_track,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className="">
        <div className={`px-6 mt-5 ${video ? '' : 'mb-5'} flex justify-between items-center`}>
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {title}
            </h3>
            {desc && (
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {desc}
              </div>
            )}
          </div>
          <div>
            {delete_track}
          </div>
        </div>
        <div className="border border-gray-100 dark:border-gray-800"></div>
        <div className="px-6 mb-5 flex mt-2 flex-wrap justify-center">
          {video && (
            <div className="m-1 text-sm text-gray-500 dark:text-gray-400">
                {video}
            </div>
          )}
          {text && (
            <div className="m-1 text-sm text-gray-500 dark:text-gray-400">
              {text}
            </div>
          )}
          {resume && (
            <div className="m-1 text-sm text-gray-500 dark:text-gray-400">
              {resume}
            </div>
          )}
          {json && (
            <div className="m-1 text-sm text-gray-500 dark:text-gray-400">
              {json}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-1 border-t border-gray-100 dark:border-gray-800 sm:p-1">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
