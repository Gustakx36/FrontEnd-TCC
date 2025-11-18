import TypeWriter from "@/components/ui/text/TypeWriter";

interface ResumeViewerProps {
  text: string;
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({ text }) => {

  return (
    <div className="p-6 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Resumo
      </h3>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
        <TypeWriter text={text} speed={7} />
      </p>
    </div>
  );
};

export default ResumeViewer;