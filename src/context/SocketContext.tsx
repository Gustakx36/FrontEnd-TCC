// src/context/SocketContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

interface LoginData {
  username: string;
  senha: string;
  idSolicitation?: number;
}

interface StatusData {
  status: "buscando" | "processando" | "concluido";
  desc?: string;
}

interface ISocketContext {
  socket: Socket | null;
  logado: boolean;
  login: LoginData;
  video: number;
  processoStatus: StatusData;
  setLogin: React.Dispatch<React.SetStateAction<LoginData>>;
  setVideo: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logado, setLogado] = useState(false);
  const [login, setLogin] = useState<LoginData>({ username: "", senha: "" });
  const [video, setVideo] = useState(0);
  const [connect, setConnect] = useState(false);

  // agora guardamos só dados, não JSX
  const [processoStatus, setProcessoStatus] = useState<StatusData>({
    status: "buscando",
  });

  const router = useRouter();
  const pathname = usePathname();
  const loginRef = useRef(login);

  useEffect(() => {
    loginRef.current = login;
  }, [login]);

  useEffect(() => {
    const s = io("https://cutwise.site", {
      path: "/socket.io/",
      transports: ["polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    setSocket(s);

    async function fetchWithTimeout(url, options = {}, timeout = 3000) {
      const res = await fetch("/api/get-cookie");
      const { username, senha } = await res.json();
      if (!username || !senha) {
        await fetch("/api/del-cookie", { method: "POST" });
        router.push("/signin");
      }
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(id);
      } catch (err) {
        clearTimeout(id);
        await fetch("/api/del-cookie", { method: "POST" });
        if(pathname != '/signin') router.push("/signin");
      }
    }

    fetchWithTimeout("/backend/check", {}, 2000);

    // ===== Handlers estáveis =====
    const handleValidaAcesso = async () => {
      const res = await fetch("/api/get-cookie");
      const { username, senha } = await res.json();
      if (username && senha) {
        s.emit("conn", { nome: username, senha: senha });
        if(pathname == '/signin') router.push("/");
      } else {
        await fetch("/api/del-cookie", { method: "POST" });
        router.push("/signin");
      }
    };

    const handleLogar = async (data: any) => {
      await fetch("/api/set-cookie", {
        method: "POST",
        body: JSON.stringify({
          username: data.username,
          senha: data.senha,
        }),
        headers: { "Content-Type": "application/json" },
      });
      setLogin((prev) => ({
        ...prev,
        username: data.username,
        senha: data.senha,
      }));
      setLogado(true);
    };

    const handleReset = async (data: any) => {
      if(data.error) toast.error(data.message)
      router.push("/signin");
    };

    const handlePaginaNova = (data: any) => {
      if (loginRef.current.idSolicitation != parseInt(data.id_solicitation)) return;
      if (!data.pagina) return;
      setProcessoStatus({ status: "processando", desc: data.pagina });
    };

    const handleDownloadProgress = (data: any) => {
      if (loginRef.current.idSolicitation != parseInt(data.id_solicitation)) return;
      if (data.status === "finished") {
        setProcessoStatus({ status: "processando" });
      } else {
        setProcessoStatus({ status: "processando", desc: `Baixando ${data.percent}%` });
      }
    };

    const handleFinalizou = (data: any) => {
      if (loginRef.current.idSolicitation != parseInt(data.id_solicitation)) return;
      setProcessoStatus({ status: "concluido" });
    };

    const handleFileFound = (data: any) => {
      if (loginRef.current.idSolicitation != parseInt(data.id_solicitation)) return;
      setVideo((prev) => prev + 1);
    };

    // ===== Registrar handlers =====
    s.on("valida acesso", handleValidaAcesso);
    s.on("logar", handleLogar);
    s.on("reset", handleReset);
    s.on("pagina_nova", handlePaginaNova);
    s.on("download_progress", handleDownloadProgress);
    s.on("finalizou_processo", handleFinalizou);
    s.on("file_found", handleFileFound);
    s.on("connect_error", () => {router.push("/signin");});
    s.on("connect", () => {setConnect(true)});

    // ===== Cleanup =====
    return () => {
      s.off("valida acesso", handleValidaAcesso);
      s.off("logar", handleLogar);
      s.off("pagina_nova", handlePaginaNova);
      s.off("download_progress", handleDownloadProgress);
      s.off("finalizou_processo", handleFinalizou);
      s.off("file_found", handleFileFound);
      s.disconnect();
    };
  }, [router]);

  return (
    <SocketContext.Provider
      value={{ socket, logado, login, video, processoStatus, connect, setLogin, setVideo, setConnect }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket precisa estar dentro de <SocketProvider>");
  return ctx;
}
