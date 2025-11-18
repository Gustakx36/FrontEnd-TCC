import DefaultInputs from "@/components/form/form-elements/DefaultInputs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cutwise",
  description: "Projeto Cutwise",
};

export default function FormElements() {
  return (
    <div>
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        Gerar Novo Trecho
      </h2>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-6">
          <DefaultInputs />
        </div>
      </div>
    </div>
  );
}
