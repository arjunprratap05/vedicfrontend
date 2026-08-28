import React from 'react';
import BookingModal from '@/components/BookingModal';

// --- Types ---
interface Service {
  id: number;
  Title: string;
  Slug: string;
  Price: number;
  DurationMinutes: number;
}

interface Astrologer {
  id: number;
  Name: string;
  ExperienceYears: number;
  Specialties: string[];
  Bio?: any; 
  ProfileImage?: any;
}

// --- Data Fetching ---
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';

async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${strapiUrl}/api/services`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id, ...item, ...(item.attributes || {})
    })) || [];
  } catch { return []; }
}

async function getAstrologer(): Promise<Astrologer | null> {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || strapiUrl;

  try {
    const res = await fetch(`${baseUrl}/api/astrologers?populate=*`, { 
      cache: 'no-store' 
    });

    if (!res.ok) {
      console.error(`[Strapi Error] Fetch failed with status: ${res.status} (${res.statusText})`);
      const errorBody = await res.text();
      console.error(`[Strapi Response]`, errorBody);
      return null;
    }

    const json = await res.json();

    if (!json.data || json.data.length === 0) {
      console.warn("[Strapi Warning] No published astrologers found in response.");
      return null;
    }

    const item = json.data[0];

    // Handles both Strapi v4 (nested attributes) and Strapi v5 (flat structure)
    return {
      id: item.id,
      documentId: item.documentId,
      ...item,
      ...(item.attributes || {}),
    };
  } catch (error) {
    console.error("[Strapi Fetch Exception]:", error);
    return null;
  }
}

function getImageUrl(mediaObj: any): string | null {
  if (!mediaObj) return null;
  const url = mediaObj.url || mediaObj.data?.attributes?.url;
  if (!url) return null;
  return url.startsWith('http') ? url : `${strapiUrl}${url}`;
}

// --- Static Data ---
const testimonials = [
  { id: 1, name: "Priya S.", text: "Sima ji's Kundali reading was incredibly accurate. She highlighted career shifts I was about to make before I even mentioned them. Highly recommended!" },
  { id: 2, name: "Rahul V.", text: "I approached her for marriage compatibility. Her guidance was clear, logical, and deeply rooted in Vedic principles. It gave my family great peace of mind." },
  { id: 3, name: "Anita K.", text: "Her calm energy and profound knowledge make every session enlightening. She doesn't just predict; she provides practical remedies." }
];

const faqs = [
  { question: "Do I need to know my exact birth time?", answer: "Yes, for a highly accurate Vedic Kundali reading, your exact time, date, and place of birth are required. Even a few minutes can shift the astrological ascendant." },
  { question: "How are the consultations conducted?", answer: "Consultations can be held in person at our Patna clinic or online via Zoom/WhatsApp. You will receive details upon booking confirmation." },
  { question: "Can I record the session?", answer: "Absolutely. I encourage clients to record their audio sessions so they can revisit the insights and remedies discussed." },
  { question: "Do you offer remedies?", answer: "Yes, I suggest practical and traditional remedies including gemstone recommendations, specific mantras, and lifestyle adjustments based on your chart." }
];

// --- Page Component ---
export default async function HomePage() {
  const [services, sima] = await Promise.all([ getServices(), getAstrologer() ]);
  const imageUrl = sima ? getImageUrl(sima.ProfileImage) : null;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={sima?.Name || 'Astrologer'} className="h-48 w-48 md:h-64 md:w-64 rounded-full object-cover border-4 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]" />
            ) : (
              <div className="h-48 w-48 md:h-64 md:w-64 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700">
                <span className="text-slate-500 text-sm">Upload Image</span>
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
              {sima?.Name || 'Sima Choudhary'}
            </h1>
            <h2 className="text-2xl text-amber-500 font-bold mb-4">
              Vedic Astro Analysis
            </h2>
            <p className="text-slate-300 text-sm font-medium tracking-wide uppercase mb-6 flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Boring Road, Patna • Professional Astrologer
            </p>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Welcome to my digital sanctuary. I offer profound astrological insights, guiding you through life's cosmic journey with clarity and compassion.
            </p>
            <BookingModal services={services} />
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100">Consultation Services</h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>
        
        {services.length === 0 ? (
          <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-400">
            No services published yet.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="bg-slate-800 border border-slate-700/60 rounded-2xl p-8 shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition">
                <div>
                  <h3 className="text-2xl font-bold text-amber-400 mb-3">{service.Title}</h3>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm uppercase tracking-wider text-slate-500">Duration</span>
                    <span className="text-slate-200 font-medium">{service.DurationMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-sm uppercase tracking-wider text-slate-500">Investment</span>
                    <span className="text-2xl font-semibold text-emerald-400">₹{service.Price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. TESTIMONIALS SECTION */}
      <section className="bg-slate-950 py-20 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">Client Experiences</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
                <div className="flex text-amber-500 mb-4 text-xl">★★★★★</div>
                <p className="text-slate-300 italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <p className="text-white font-semibold">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100">Frequently Asked Questions</h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden cursor-pointer">
              <summary className="px-6 py-4 text-lg font-medium text-slate-200 hover:text-amber-400 list-none flex justify-between items-center transition">
                {faq.question}
                <span className="text-amber-500 group-open:rotate-45 transition-transform duration-300 text-2xl">+</span>
              </summary>
              <div className="px-6 pb-4 text-slate-400 border-t border-slate-700/50 pt-4 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 5. CONTACT & LOCATION SECTION */}
      <section className="bg-slate-950 py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-100 mb-12">Get in Touch</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="text-amber-500 text-3xl mb-4">📍</div>
              <h3 className="text-lg font-bold text-white mb-2">Visit the Clinic</h3>
              <p className="text-slate-400">Boring Road<br/>Patna, Bihar 800013</p>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="text-amber-500 text-3xl mb-4">📞</div>
              <h3 className="text-lg font-bold text-white mb-2">Call or WhatsApp</h3>
              <p className="text-slate-400">062051 35569</p>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="text-amber-500 text-3xl mb-4">🕒</div>
              <h3 className="text-lg font-bold text-white mb-2">Operating Hours</h3>
              <p className="text-slate-400">Opens at 12:00 PM<br/>By Appointment Only</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-900 py-8 border-t border-slate-800 text-center text-slate-500">
        <p>© {new Date().getFullYear()} Sima Choudhary Vedic Astro Analysis. All rights reserved.</p>
      </footer>

    </main>
  );
}