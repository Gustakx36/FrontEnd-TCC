export default function HighLighter({ text, currentTimeWord, playerAtual }: any) {
  return (
    <p className="text-gray-900 dark:text-gray-100">
      {text.map((word, i) => {
        const tempoFala = (word.end - word.start) * 1000; // converte para ms
        return (
          <span
            key={i}
            style={{ transitionDuration: `${tempoFala}ms` }}
            className={`transition-colors font-bold ${
              word.start < currentTimeWord && playerAtual
                ? "dark:text-yellow-500 text-yellow-800"
                : ""
            }`}
          >
            {word.word}
          </span>
        );
      })}
    </p>
  );
}
