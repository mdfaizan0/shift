import { Toaster } from "@/components/ui/sonner";
import BottomNav from "../BottomNav";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 pb-24 md:pb-0">{children}</main>
            <BottomNav />
            <Toaster position="top-center" expand={true} richColors />
        </div>
    );
};

export default AppLayout;
