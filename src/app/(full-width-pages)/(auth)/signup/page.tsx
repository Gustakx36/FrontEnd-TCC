import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Tela de Login para Cutwise",
};

export default function SignUp() {
  return <SignUpForm />;
}
