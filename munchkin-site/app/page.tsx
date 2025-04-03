import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AuthUI } from "@/components/auth/AuthUI";

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center my-8">Munchkin Site</h1>
      <div className="my-8">
        <AuthUI />
      </div>
    </main>
  );
}
