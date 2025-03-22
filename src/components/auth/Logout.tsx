"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
    const router = useRouter();

    useEffect(() => {
        const logout = async () => {
            await fetch("/api/logout", { method: "GET" });
            router.push("/signin"); // Redirect to login after logout
        };

        logout();
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Logging out...</p>
        </div>
    );
};

export default LogoutPage;
