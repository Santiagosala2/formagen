import { Card, CardContent } from "@/components/ui/card";
import { FormBuilder } from "@/components/ui/formBuilder/formBuilder";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen gap-6 py-4 px-4">
      <FormBuilder />
    </div>
  );
}
