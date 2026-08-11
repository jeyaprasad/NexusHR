import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ChatWidget } from "./ChatWidget";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
