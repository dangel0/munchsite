import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";


export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center my-8">Welcome to Munchkin Site</h1>
      <div className="my-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Your Adventure Awaits!</h2>
        <p className="mb-4">
          You're now logged in and ready to explore all the features of Munchkin Site.
          Check out your dreams, adventures, and more!
        </p>
        <div className="flex flex-wrap gap-4 mt-6">
          <Button asChild>
            <a href="/dreams">View Dreams</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/adventures">Explore Adventures</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
