import { SignIn } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthGuard from "@/components/auth/AuthGuard";

export default function LoginPage() {
    return (
        <AuthGuard publicOnly>
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-md border-none shadow-none bg-transparent">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
                        <p className="text-muted-foreground text-sm">Sign in to your Shift account</p>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "shadow-none border border-border rounded-xl",
                                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                                    footerActionLink: "text-primary hover:text-primary/90"
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthGuard>
    );
}
