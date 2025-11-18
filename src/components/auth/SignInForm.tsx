"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useSocket } from '@/context/SocketContext';
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SignInForm() {
  const { socket, connect, setConnect } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [username, setUsername] = useState(undefined);
  const [senha, setSenha] = useState(undefined);

  const login = async () => {
    if(!username || !senha){
      return toast.error('É preciso preencher os dados para login!');
    }
    const res = await fetch(`https://cutwise.site/backend/valida_acesso/${username}`,
      {
        method: "GET",
      }
    );
    const { status } = await res.json();
    if(!status) return toast.error('Usuário não existe!');
    socket.emit('senhaMD5', { nome: username, senha: senha });
    router.push('/');
  }

  const fetchWithTimeout = async (url, options = {}, timeout = 3000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(id);
        return true;
      } catch (err) {
        return false;
      }
    }

  const handleLogin = async () => {
    const check = await fetchWithTimeout("/backend/check", {}, 1000);
    if(check) return login();
    setConnect(false);
    await fetch("/api/del-cookie", { method: "POST" });
    toast.error('Serviço Indisponível!')
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Logar
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preecha seu usuário e senha para logar!
            </p>
          </div>
          <div>
            <div className="space-y-6">
              <div>
                <Label>
                  User <span className="text-error-500">*</span>{" "}
                </Label>
                <Input 
                  placeholder="Enter your Username" 
                  type="text" 
                  onChange={(e) => setUsername(e.target.value)}/>
              </div>
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>{" "}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              {connect ? (
                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={handleLogin}
                  >
                    Sign in
                  </Button>
                </div>
              ) : (
                <div className="w-full text-center text-sm text-red-500 mt-2">
                  Servidor inativo. Tente novamente mais tarde.
                </div>
              )}
            </div>

            {false && <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
