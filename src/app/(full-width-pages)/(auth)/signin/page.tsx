import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Tela de Login para Cutwise",
};

export default function SignIn() {
  return <SignInForm />;
}
