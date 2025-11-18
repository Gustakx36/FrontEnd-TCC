"use client"
import Pagination from "@/components/tables/Pagination";
import Button from "@/components/ui/button/Button";
import TextViewer from "@/components/form/form-elements/TextViewer";
import ResumeViewer from "@/components/form/form-elements/ResumeViewer";
import ComponentCard from "@/components/common/ComponentCard";
import YouTubeEmbed from "@/components/ui/video/YouTubeEmbed";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ConfirmAlert from "@/components/common/ConfirmAlert";
import { useTheme } from "@/context/ThemeContext";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@/components/ui/badge/StatusTags";
import { useSocket } from '@/context/SocketContext';
import { Trash } from "lucide-react";
import toast from "react-hot-toast";

export default function page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
  const { socket, logado, login, video, processoStatus, setLogin, setVideo } = useSocket();
  const videoPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [idSolicitation, setIdSolicitation] = useState("");
  const [status, setStatus] = useState(<Status status="buscando"/>);
  const [statusBool, setStatusBool] = useState(false);
  const [videos, setVideos] = useState([]);
  const [padrao, setPadrao] = useState("");
  const [carregado, setCarregado] = useState(false);
  const [dataJson, setDataJson] = useState<any>(null);
  const [item, setItem] = useState("video");
  const [idsTarget, setIdsTarget] = useState([]);
  const [resume, setResume] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const { theme } = useTheme();

  const router = useRouter();

  function corrigirTempos(segments) {
    let offset = -1;

    return segments.map((s, i) => {
      if (s.id === 1) offset += 1;

      const startOffset = 60 * offset;

      return {
        ...s,
        id: i,
        start: s.start + startOffset,
        end: s.end + startOffset,
        words: s.words
          ? s.words.map((w) => ({
              ...w,
              start: w.start + startOffset,
              end: w.end + startOffset,
            }))
          : [],
      };
    });
  }

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(dataJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${idSolicitation}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteTrecho = async (idSolicitation: string) => {
    try {
      const response = await fetch(`https://cutwise.site/backend/delete/${idSolicitation}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return toast.error(`Erro ao deletar Trecho ${idSolicitation}!`);
      }

      toast.success(`Trecho ${idSolicitation} deletado!`);

      return router.push('/');

    } catch (err) {
      toast.error("Erro de conexão:", err);
    }
  };

  useEffect(() => {
		setStatus(<Status status="buscando"/>);
    setStatusBool(false);
    setResume(false);
	}, [idSolicitation]);

  useEffect(() => {
		async function loadIdSolicitation() {
			const { id } = await params;
      document.title = `${id}`;
      setIdSolicitation(id);
		}
		loadIdSolicitation();
    const render = async () => {
      if(!logado || !idSolicitation) return;
      const res = await fetch(`https://cutwise.site/backend/arquivo_trecho?` + 
        new URLSearchParams({
          id_solicitation: idSolicitation,
          id: socket.id
        }),
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        setCarregado(false);
        setStatusBool(false);
        return setStatus(<Status status="erro"/>);
      }

      const items = await res.json();
      
      setPadrao(items.dados.padrao);

      setTotalPages(Math.ceil(items.arquivos.length/videoPerPage));

      const inicio = (currentPage - 1) * videoPerPage;
      const fim = inicio + videoPerPage;

      const tempitems = items.arquivos.slice(inicio, fim);

      setVideos(tempitems.map((item, index) => (
          <ComponentCard title={`Video ${(index + 1) + (videoPerPage * (currentPage - 1))}`}>
            <YouTubeEmbed
              idSolicitation={idSolicitation}
              arquivo={item}
            />
          </ComponentCard>
      )));

      setLogin((prev) => ({
        ...prev,
        idSolicitation: parseInt(idSolicitation)
      }));

      if(items.dados.data_final) {
        setStatus(<Status status="concluido"/>);
        const resJson = await fetch(`https://cutwise.site/backend/get-json/${idSolicitation}`);
        const json = await resJson.json();
        const corrigido = corrigirTempos(json);
        setDataJson(corrigido);

        const resResume = await fetch(`https://cutwise.site/backend/get-resumo/${idSolicitation}`);
        const resumo = await resResume.json();
        if(resumo.status){
          setResume(true);
          setResumeContent(resumo.resumo);
        }
          
        setStatusBool(true);
      }
      if(!items.dados.data_final) {
        const resJson = fetch(`https://cutwise.site/backend/paginas?id_solicitation=${idSolicitation}`);
      }

      setIdsTarget(items.arquivos.map(file => {
        const match = file.match(/id\(\d+_(\d+)_\d+\)/);
        return match ? parseInt(match[1], 10) : null;
      }));

      setCarregado(true);
    }
    render();
	}, [idSolicitation, logado, currentPage]);

  useEffect(() => {
    const render = async () => {
      if(!logado || !idSolicitation) return;
      const res = await fetch(`https://cutwise.site/backend/arquivo_trecho?` + 
        new URLSearchParams({
          id_solicitation: idSolicitation
        }),
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        setCarregado(false);
        setStatusBool(false);
        return setStatus(<Status status="erro"/>);
      }

      const items = await res.json();

      setTotalPages(Math.ceil(items.arquivos.length/videoPerPage));

      setIdsTarget(items.arquivos.map(file => {
        const match = file.match(/id\(\d+_(\d+)_\d+\)/);
        return match ? parseInt(match[1], 10) : null;
      }));

      if(currentPage < totalPages) return;

      const inicio = (currentPage - 1) * videoPerPage;
      const fim = inicio + videoPerPage;

      const tempitems = items.arquivos.slice(inicio, fim);

      setVideos(tempitems.map((item, index) => (
          <ComponentCard title={`Video ${index + 1}`}>
            <YouTubeEmbed
              idSolicitation={idSolicitation}
              arquivo={item}
            />
          </ComponentCard>
      )));

      setCarregado(true);
    }
    render();
	}, [video]);

  useEffect(() => {
    setStatus(<Status status={processoStatus.status} desc={processoStatus.desc}/>);
    if(processoStatus.status == 'concluido'){
      const renderJson = async () => {
        const { id } = await params;
        const resJson = await fetch(`https://cutwise.site/backend/get-json/${id}`);
        const json = await resJson.json();
        const corrigido = corrigirTempos(json);
        setDataJson(corrigido);

        const resResume = await fetch(`https://cutwise.site/backend/get-resumo/${id}`);
        const resumo = await resResume.json();
        if(resumo.status){
          setResume(true);
          setResumeContent(resumo.resumo);
        }
      }
      renderJson();
      return setStatusBool(true);
    }
    setStatusBool(false);
	}, [processoStatus]);
  
  return (
    <div>
      <PageBreadcrumb pageTitle="Trecho" />
      <div className="space-y-6">
        <ComponentCard 
          title={`${idSolicitation} (Busca = "${padrao}")`}
          desc={status} 
          video={(carregado && videos.length > 0 ) && <Button size="mn" className="h-[100%]" onClick={() => setItem("video")}>Videos</Button>}
          json={statusBool && <Button size="mn" className="h-[100%]" onClick={handleDownloadJson}>Baixar Json</Button>}
          text={statusBool && <Button size="mn" className="h-[100%]" onClick={() => setItem("text")}>Trascrição</Button>}
          resume={(statusBool && resume) && <Button size="mn" className="h-[100%]" onClick={() => setItem("resume")}>Resumo</Button>}
          delete_track={statusBool && (
            <Button 
              size="mn" size="icon"
              variant="ghost"
              className="p-2 bg-red-500 hover:bg-red-800 text-white"
              onClick={() => setShowAlert(true)}>
                <Trash className="h-5 w-5 text-white" />
            </Button>
          )}>
          <div>
            {(() => {
              switch (item) {
                case "video":
                  return <>
                   <div className="flex flex-wrap">
                    {videos.map((video, i) => (
                      <div
                        key={i}
                        className="opacity-0 animate-fade-in sm:w-[50%] p-2 w-[100%]"
                        style={{ animationDelay: `${i * 150}ms` }} // atraso de 150ms entre cada vídeo
                      >
                        {video}
                      </div>
                    ))}
                  </div>
                    {(carregado && videos.length > 0 && totalPages > 1) && <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                    />}
                  </>;
                case "text":
                  return <TextViewer segments={dataJson} ids={idsTarget} idSolicitation={idSolicitation} />;
                case "resume":
                  return <ResumeViewer text={resumeContent} />;
              }
            })()}
          </div>
        </ComponentCard>
      </div>
      <ConfirmAlert
        open={showAlert}
        onCancel={() => setShowAlert(false)}
        onConfirm={async () => {
          setShowAlert(false);
          await handleDeleteTrecho(idSolicitation);
        }}
      />
    </div>
  );
}
