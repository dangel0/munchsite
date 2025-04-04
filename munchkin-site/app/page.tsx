import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";


export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center my-8">Hey Buddy,</h1>
      <h2 className="text-xl text-center mb-6">Love u</h2>
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Employee of the Month
      </h1>
      <Separator className="my-6" />
      <div className="flex justify-center">
        <img 
          src="https://media.licdn.com/dms/image/v2/D5603AQEA9FMLG8K4Gw/profile-displayphoto-shrink_800_800/B56ZTs3rPiGQAk-/0/1739140805907?e=1749081600&v=beta&t=BNSfI6vRPxGZoDxW44lDYxP5sVNjumrFtiTZQlKA83w" 
          alt="Profile photo" 
          className="border-4 border-black rounded-lg shadow-lg max-w-xs"
        />
      </div>
      <div className="text-center mt-4">
        <p className="text-4xl font-semibold">Nene!</p>
      </div>

    </main>
  );
}
