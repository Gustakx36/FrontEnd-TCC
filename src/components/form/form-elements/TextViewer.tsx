"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "@/components/ui/video/AudioPlayer";
import HighLighter from "@/components/form/form-elements/HighLighter";
import Pagination from "@/components/tables/Pagination";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function SegmentList({ segments, ids, idSolicitation }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [click, setClick] = useState(false);
  const [pause, setPause] = useState(false);
  const [atualClick, setAtualClick] = useState(-1);
  const [atualClickWord, setAtualClickWord] = useState(-1);
  const [currentTimeWord, setCurrentTimeWord] = useState(-1);
  const [automaticView, setAutomaticView] = useState(false);
  const [highLighted, setHighLighted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 50;

  const filteredSegments = segments
    .filter((s) => {
      const isHighlighted = ids.includes(s.id);
      if (highLighted && !isHighlighted) return false;
      return normalizeText(s.text).includes(normalizeText(query));
    })
    .slice(visibleCount - itemsPerPage, visibleCount);

  const otherFilteredSegments = segments.filter((s) => {
    const isHighlighted = ids.includes(s.id);
    if (highLighted && !isHighlighted) return false;
    return normalizeText(s.text).includes(normalizeText(query));
  });

  useEffect(() => {
    if (currentTimeWord < 0 || !automaticView) return;

    const index = otherFilteredSegments.findLastIndex(
      (s) => {
        const isHighlighted = ids.includes(s.id);
        if (highLighted && !isHighlighted) return false;
        return currentTimeWord >= s.start;
      }
    );

    if (index !== -1) {
      const page = Math.floor(index / itemsPerPage) + 1;
      const currentPage = visibleCount / itemsPerPage;

      if (page !== currentPage) {
        setVisibleCount(page * itemsPerPage);
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: 0
          });
        }
      }

      setTimeout(() => {
        document
          .getElementById(`segment-${index}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [currentTimeWord, automaticView]);

  return (
    <div className="space-y-3">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Buscar trecho..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(itemsPerPage);
          }}
          className="w-full px-3 py-2 pr-12 rounded-xl border border-gray-300 dark:border-gray-700 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Botão dentro do input */}
        <button
          type="button"
          onClick={() => {
            setHighLighted(!highLighted);
            setVisibleCount(itemsPerPage);
          }}
          className={`absolute right-2 top-1/2 -translate-y-1/2 
                      px-3 py-1 rounded-md text-xs font-medium transition 
                      ${
                        highLighted
                          ? "bg-blue-600 text-white hover:bg-blue-500"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
        >
          {highLighted ? "✓" : "E"}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="relative p-4 pt-0 pb-0 rounded-2xl bg-gray-100 dark:bg-gray-900 
                   border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-mono 
                   space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar"
      >
        <AudioPlayer
          audioUrl={`https://cutwise.site/backend/audio/${idSolicitation}`}
          startTime={startTime}
          endTime={endTime}
          atualClick={atualClick}
          click={click}
          automaticView={automaticView}
          setClick={setClick}
          setAtualClick={setAtualClick}
          pause={pause}
          setPause={setPause}
          setCurrentTimeWord={setCurrentTimeWord}
          setAtualClickWord={setAtualClickWord}
          setAutomaticView={setAutomaticView}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={visibleCount}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.1, staggerChildren: 0.05 }}
            className="space-y-2"
          >
            {filteredSegments.map((s, i) => {
              const isHighlighted = ids.includes(s.id);
              const playerAtual = atualClickWord == i || atualClickWord == -1;
              const globalIndex = visibleCount - itemsPerPage + i;

              return (
                <motion.div
                  id={`segment-${globalIndex}`}
                  key={s.start}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.1 }}
                  className={`p-2 rounded-lg border shadow-sm flex justify-between items-center
                    ${
                      isHighlighted
                        ? "bg-yellow-100 dark:bg-yellow-800 border-yellow-500"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <div className="w-[90%]">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {s.id + 1}: [{formatTime(s.start)}] → [{formatTime(s.end)}]
                    </div>
                    <HighLighter
                      text={s.words}
                      currentTimeWord={currentTimeWord}
                      playerAtual={playerAtual}
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        if (atualClick == i) return setPause(true);
                        setCurrentTimeWord(
                          s.start - 0.1 < 0 ? s.start : s.start - 0.1
                        );
                        setStartTime(s.start - 0.1 < 0 ? s.start : s.start - 0.1);
                        setEndTime(s.end + 0.1);
                        setAtualClick(i);
                        setAtualClickWord(i);
                        setClick(true);
                      }}
                      className="ml-2 px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-500 transition"
                    >
                      {atualClick == i ? "Pause" : "Play"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div
          className="sticky bottom-0 left-0 
                     bg-white dark:bg-gray-900 
                     border-t border-gray-300 dark:border-gray-700 
                     p-3 flex flex-col gap-2"
        >
          <Pagination
            currentPage={visibleCount / itemsPerPage}
            totalPages={Math.ceil(otherFilteredSegments.length / itemsPerPage)}
            onPageChange={(page) => {
              setVisibleCount(page * itemsPerPage);
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
