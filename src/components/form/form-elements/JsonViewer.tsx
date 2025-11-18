"use client";
import React, { useEffect, useState } from "react";

interface JsonViewerProps {
  data?: any;
}

function syntaxHighlight(json: any) {
  if (!json) return "";
  if (typeof json !== "string") {
    json = JSON.stringify(json, undefined, 2);
  }
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-gray-800 dark:text-gray-100";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-purple-600 dark:text-purple-400"; // chave
        } else {
          cls = "text-green-600 dark:text-green-400"; // string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-blue-600 dark:text-blue-400";
      } else if (/null/.test(match)) {
        cls = "text-red-600 dark:text-red-400";
      } else {
        cls = "text-yellow-600 dark:text-yellow-400"; // número
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Carregando...</span>
      </div>
    );
  }

  return (
    <pre
      className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 
      text-sm leading-6 font-mono overflow-x-auto shadow-sm custom-scrollbar"
      dangerouslySetInnerHTML={{ __html: syntaxHighlight(data) }}
    />
  );
};

export default JsonViewer;
