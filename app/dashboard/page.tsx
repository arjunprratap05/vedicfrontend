"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("astrologer_jwt");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
        
        const userResponse = await fetch(`${API_URL}/api/users/me`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        
        if (userResponse.ok) {
          setUser(await userResponse.json());
        } else throw new Error("Invalid token");

        const bookingsResponse = await fetch(`${API_URL}/api/bookings?populate=*&sort=createdAt:desc`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (bookingsResponse.ok) {
          const json = await bookingsResponse.json();
          setBookings(json.data);
        }
      } catch (error) {
        localStorage.removeItem("astrologer_jwt");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  // Function to toggle attendance status in Strapi using documentId
  const toggleAttendance = async (booking: any) => {
    const identifier = booking.documentId || booking.id;
    const currentStatus = booking.isAttended;
    const newStatus = !currentStatus;

    // Optimistically update the UI instantly
    setBookings((prevBookings) => 
      prevBookings.map((b) => (b.documentId === identifier || b.id === identifier) ? { ...b, isAttended: newStatus } : b)
    );

    try {
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
      await fetch(`${API_URL}/api/bookings/${identifier}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("astrologer_jwt")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { isAttended: newStatus } }),
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert UI if API fails
      setBookings((prevBookings) => 
        prevBookings.map((b) => (b.documentId === identifier || b.id === identifier) ? { ...b, isAttended: currentStatus } : b)
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("astrologer_jwt");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 font-bold gap-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Astrologer <span className="text-amber-500">Workspace</span>
            </h1>
            <p className="text-slate-400 mt-1">Manage your upcoming consultation requests</p>
          </div>
          <div className="flex items-center gap-6 bg-slate-950/50 py-3 px-6 rounded-2xl border border-slate-800/50">
            <div className="text-right hidden sm:block">
              <p className="text-white font-bold text-lg leading-tight capitalize">{user?.username || "Astrologer"}</p>
              <p className="text-amber-500/80 text-sm font-medium">{user?.email}</p>
            </div>
            <div className="h-12 w-12 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="w-px h-10 bg-slate-800 mx-2"></div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 font-semibold transition-colors flex items-center gap-2">
              Logout
            </button>
          </div>
        </header>

        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            Recent Requests
            <span className="bg-amber-500/10 text-amber-500 py-1 px-3 rounded-full text-sm font-black">{bookings.length}</span>
          </h2>

          <div className="grid gap-5">
            {bookings.length === 0 ? (
              <div className="text-slate-400 text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
                <p className="text-lg">No consultation requests yet.</p>
              </div>
            ) : (
              bookings.map((booking: any) => (
                <div 
                  key={booking.documentId || booking.id} 
                  className={`group border p-6 rounded-2xl shadow-lg transition-all duration-300 ${
                    booking.isAttended 
                      ? "bg-slate-900/50 border-slate-800/50 opacity-75" 
                      : "bg-slate-900 border-slate-800 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    
                    <div className="space-y-2">
                      <h3 className={`text-xl font-bold flex items-center gap-2 ${booking.isAttended ? "text-slate-400 line-through" : "text-white"}`}>
                        {booking.fullName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <p className={`${booking.isAttended ? "text-slate-500" : "text-amber-500"} font-medium`}>
                          {booking.phone}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 mt-2">
                        <span className="text-slate-400 text-sm">Service:</span>
                        <span className={`font-semibold text-sm ${booking.isAttended ? "text-slate-400" : "text-amber-400"}`}>
                          {booking.service?.Title || "Not specified"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        {booking.date}
                      </span>
                      
                      <button
                        onClick={() => toggleAttendance(booking)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors w-full sm:w-auto border ${
                          booking.isAttended 
                            ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-slate-900"
                        }`}
                      >
                        {booking.isAttended ? "Mark as Unattended" : "Mark as Attended"}
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}