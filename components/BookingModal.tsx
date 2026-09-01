"use client";

import React, { useState } from 'react';

// Define the shape of the services we are passing in
interface Service {
  id: number;
  Title: string;
}

interface BookingModalProps {
  services: Service[];
}

export default function BookingModal({ services }: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = new FormData(e.currentTarget);
    
    // 1. Prepare the data payload (Strapi expects relations as integer IDs)
    const bookingData = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      date: formData.get("date"),
      service: Number(formData.get("service")), 
    };

    try {
      // 2. Dynamically fetch the API URL from environment variables, with a production fallback
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://vedicbackend-1gez.onrender.com";
      
      // 3. Send to Strapi (Strapi requires the payload to be wrapped in a 'data' object)
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: bookingData }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus("idle");
        }, 3000); // Close modal after 3 seconds
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Failed to book:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* The Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="mt-8 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full transition transform hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
      >
        Book a Consultation
      </button>

      {/* The Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          
          {/* The Modal Box */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold text-amber-400 mb-6">Schedule Your Session</h2>

            {submitStatus === "success" ? (
              <div className="text-emerald-400 text-center py-8 text-lg font-semibold">
                Thank you! Your booking has been received.
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <input 
                    id="fullName"
                    name="fullName"
                    type="text" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Enter Name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-400 mb-1">Phone / WhatsApp</label>
                  <input 
                    id="phone"
                    name="phone"
                    type="tel" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="+91 00000 00000"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-slate-400 mb-1">Select a Service</label>
                  <select 
                    id="service"
                    name="service"
                    defaultValue=""
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="" disabled>Choose a consultation type...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.Title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-slate-400 mb-1">Preferred Date</label>
                  <input 
                    id="date"
                    name="date"
                    type="date" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {submitStatus === "error" && (
                  <p className="text-red-400 text-sm">Failed to submit. Please ensure Strapi is running.</p>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-white font-bold py-3 rounded-lg transition"
                >
                  {isSubmitting ? "Submitting..." : "Confirm Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}