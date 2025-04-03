import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";


export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center my-8">Hey Buddy,</h1>
      <div className="my-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Munchkinaville</h2>
      </div>
    </main>
  );
}
