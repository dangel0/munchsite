import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <div className="text-center space-y-6 animate-fadeIn">
        <h1 className="text-3xl font-bold my-8 relative">
          <span className="absolute -left-8 top-1/2 transform -translate-y-1/2 hidden md:block">
            <span className="text-4xl animate-bounce inline-block text-blue-500">👋</span>
          </span>
          Hey Buddy,
          <span className="absolute -right-8 top-1/2 transform -translate-y-1/2 hidden md:block">
            <span className="text-4xl animate-bounce inline-block text-blue-500 delay-150">👋</span>
          </span>
        </h1>
        
        <h2 className="text-xl mb-6 italic text-gray-600 dark:text-gray-400">Love u</h2>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105">
          <h1 className="text-4xl font-bold text-white">
            Employee of the Month
          </h1>
        </div>
      </div>
      
      <Separator className="my-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
      
      <div className="flex justify-center">
        <div className="relative transition-all duration-300 transform hover:scale-105 hover:rotate-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <img 
            src="https://media.licdn.com/dms/image/v2/D5603AQEA9FMLG8K4Gw/profile-displayphoto-shrink_800_800/B56ZTs3rPiGQAk-/0/1739140805907?e=1749081600&v=beta&t=BNSfI6vRPxGZoDxW44lDYxP5sVNjumrFtiTZQlKA83w" 
            alt="Profile photo" 
            className="relative bg-white dark:bg-gray-800 p-2 border-4 border-white dark:border-gray-800 rounded-lg shadow-xl max-w-xs"
          />
        </div>
      </div>
      
      <div className="text-center mt-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <p className="text-4xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent inline-block">Nene!</p>
        <div className="mt-2 flex justify-center gap-2">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">Amazing</span>
          <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">Awesome</span>
          <span className="inline-block px-4 py-1 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200 rounded-full text-sm font-medium">Cool</span>
        </div>
      </div>
    </main>
  );
}
