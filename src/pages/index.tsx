import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useToast } from "@/context/ToastContext";
import {
  FiPhone,
  FiMail,
  FiGlobe,
  FiSmartphone,
  FiCpu,
  FiCreditCard,
  FiUsers,
    FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
} from "react-icons/fi";

import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaTelegramPlane,
} from "react-icons/fa";

type Project = {
  _id: string;
  title: string;
  link: string;
  image: string;
  description: string;
  language: string;
  credentials?: Array<{
    role: string;
    email: string;
    password: string;
  }>;
};

type MobileApp = {
  _id: string;
  title: string;
  androidLink: string;
  iosLink: string;
  description: string;
  language: string;
  image: string;
};

type Software = {
  _id: string;
  title: string;
  description: string;
  link: string;
  image: string;
  language: string;
  credentials?: Array<{
    role: string;
    email: string;
    password: string;
  }>;
};

type DigitalCard = {
  _id: string;
  title: string;
  description: string;
  link: string;
  image: string;
};

type MarketingClient = {
  _id: string;
  title: string;
  description: string;
  link: string;
  image: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE;

export default function Home() {
  const { isUnlocked, login, logout, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [pinValues, setPinValues] = useState<string[]>(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pinRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [activeTab, setActiveTab] = useState("projects");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareItem, setShareItem] = useState<CardItem | null>(null);
  const [shareType, setShareType] = useState<
    "projects" | "mobile-app" | "software" | "digital-card" | "marketing-clients" | null
  >(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [mobileApps, setMobileApps] = useState<MobileApp[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [digitalCards, setDigitalCards] = useState<DigitalCard[]>([]);
  const [marketingClients, setMarketingClients] = useState<MarketingClient[]>(
    [],
  );
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set(),
  );
  const [expandedCredentials, setExpandedCredentials] = useState<Set<string>>(
    new Set(),
  );
const [visibleCredentials, setVisibleCredentials] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    if (!isUnlocked) {
      setTimeout(() => pinRefs.current[0]?.focus(), 100);
    } else {
      fetchData();
    }
  }, [isUnlocked]);

  const fetchData = async () => {
    try {
      setIsLoadingData(true);
      setDataError("");
      const [projectsRes, appsRes, softwareRes, cardsRes, clientsRes] =
        await Promise.all([
          axios.get(`${API_BASE}/projects`, { timeout: 10000 }).catch((err) => {
            console.error("Projects API Error:", err);
            throw new Error("Failed to load projects");
          }),
          axios
            .get(`${API_BASE}/mobile-apps`, { timeout: 10000 })
            .catch((err) => {
              console.error("Mobile Apps API Error:", err);
              throw new Error("Failed to load mobile apps");
            }),
          axios.get(`${API_BASE}/software`, { timeout: 10000 }).catch((err) => {
            console.error("Software API Error:", err);
            throw new Error("Failed to load software");
          }), 
          axios
            .get(`${API_BASE}/digital-cards`, { timeout: 10000 })
            .catch((err) => {
              console.error("Digital Cards API Error:", err);
              throw new Error("Failed to load digital cards");
            }),
          axios
            .get(`${API_BASE}/marketing-clients`, { timeout: 10000 })
            .catch((err) => {
              console.error("Marketing Clients API Error:", err);
              throw new Error("Failed to load marketing clients");
            }),
       
        ]);
      setProjects(projectsRes.data.data || []);
      setMobileApps(appsRes.data.data || []);
      setSoftware(softwareRes.data.data || []);
      setDigitalCards(cardsRes.data.data || []);
      setMarketingClients(clientsRes.data.data || []);
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Error loading data";
      setDataError(errorMsg);
      console.error("Data fetch error:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const validatePin = (value: string): boolean => {
    if (!/^[0-9]{4}$/.test(value)) {
      setPinError("PIN must be 4 digits");
      return false;
    }
    return true;
  };

  const handlePinChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...pinValues];
    next[index] = val;
    setPinValues(next);

    if (val && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
    if (!val && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }

    setPinError("");

    if (next.every((v) => v !== "")) {
      const pinValue = next.join("");
      if (validatePin(pinValue)) {
        handleLogin(pinValue);
      }
    }
  };

  const handleLogin = async (pin: string) => {
    try {
      setIsSubmitting(true);
      setPinError("");
      await login(pin);
      showToast("PIN correct. Unlocked successfully.", { type: "success" });
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Invalid PIN. Please try again.";
      setPinError(msg);
      setTimeout(() => {
        setPinValues(["", "", "", ""]);
        pinRefs.current[0]?.focus();
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setPinValues(["", "", "", ""]);
    setPinError("");
    showToast("Logged out.", { type: "info" });
  };

  const togglePasswordVisibility = (credId: string) => {
    const newSet = new Set(visiblePasswords);
    if (newSet.has(credId)) {
      newSet.delete(credId);
    } else {
      newSet.add(credId);
    }
    setVisiblePasswords(newSet);
  };
const toggleCredentials = (id: string) => {
  const updated = new Set(visibleCredentials);
  updated.has(id) ? updated.delete(id) : updated.add(id);
  setVisibleCredentials(updated);
};
  const tabs = [
    {
      key: "projects",
      label: (
        <span className="flex items-center gap-2">
          <FiGlobe /> Projects
        </span>
      ),
    },
    {
      key: "mobile-app",
      label: (
        <span className="flex items-center gap-2">
          <FiSmartphone /> Mobile Apps
        </span>
      ),
    },
    {
      key: "software",
      label: (
        <span className="flex items-center gap-2">
          <FiCpu /> Software
        </span>
      ),
    },
    {
      key: "digital-card",
      label: (
        <span className="flex items-center gap-2">
          <FiCreditCard /> Digital Cards
        </span>
      ),
    },
    {
      key: "marketing-clients",
      label: (
        <span className="flex items-center gap-2">
          <FiUsers /> Marketing Clients
        </span>
      ),
    },
  ];

  const handleShare = (
    item: CardItem,
    type:
      | "projects"
      | "mobile-app"
      | "software"
      | "digital-card"
      | "marketing-clients",
  ) => {
    setShareItem(item);
    setShareType(type);
    setShowShareModal(true);
  };

  const shareOn = (
    platform: "whatsapp" | "facebook" | "twitter" | "linkedin" | "telegram" | "copy",
  ) => {
    if (!shareItem || !shareType) return;
    const url =
      shareType === "mobile-app"
        ? (shareItem as MobileApp).androidLink ||
          (shareItem as MobileApp).iosLink ||
          (shareItem as any).link ||
          ""
        : (shareItem as any).link || "";
    if (!url) {
      alert("Invalid URL");
      return;
    }
    const title = shareItem.title || "";
    const desc = shareItem.description || "";
    const encodedUrl = encodeURIComponent(url);
    const message = `Check this out: ${title}\n\n${desc ? desc + "\n\n" : ""}${url}`;
    const encodedMsg = encodeURIComponent(message);
    const encodedQuote = encodeURIComponent(`Check this out: ${title}\n\n${desc}`);

    const links: Record<typeof platform, string> = {
      whatsapp: `https://wa.me/?text=${encodedMsg}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        "Check this out: " + title,
      )}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(
        "Check this out: " + title + (desc ? "\n\n" + desc : ""),
      )}`,
      copy: "",
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(message);
      alert("Details copied to clipboard!");
    } else {
      window.open(links[platform], "_blank");
    }
    setShowShareModal(false);
  };

  type CardItem =
    | Project
    | MobileApp
    | Software
    | DigitalCard
    | MarketingClient;
  const renderCard = (
    item: CardItem,
    type:
      | "projects"
      | "mobile-app"
      | "software"
      | "digital-card"
      | "marketing-clients",
  ) => {
    const hasCredentials = (type === "projects" || type === "software") && 
      (item as Project | Software).credentials && 
      (item as Project | Software).credentials!.length > 0;
    const isExpanded = hasCredentials && visibleCredentials.has(item._id);
    
    return (
      <div
        key={item._id}
        className={`bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col border border-white/30 ${
          isExpanded ? 'min-h-[600px]' : 'min-h-[450px]'
        }`}
      >
        {item.image && (
          <div className="w-full h-56 bg-white flex items-center justify-center">
            <img
              src={`${IMAGE_BASE}${item.image}`}
              alt={item.title}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="p-6 flex flex-col gap-3 flex-1">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 flex-1 line-clamp-3 leading-relaxed">
            {item.description}
          </p>
          {"language" in item &&
            (item as Project | MobileApp | Software).language && (
              <span className="inline-block px-3 py-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white text-xs font-semibold rounded-lg w-fit">
                {(item as Project | MobileApp | Software).language}
              </span>
            )}
          
   {(type === "projects" || type === "software") && 
    (item as Project | Software).credentials && 
    (item as Project | Software).credentials!.length > 0 && (
  <div className="mt-2">
    <button
      onClick={() => toggleCredentials(item._id)}
      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-all font-medium"
    >
      {visibleCredentials.has(item._id) ? (
        <>
          <FiChevronUp size={14} />
          Hide Credentials
        </>
      ) : (
        <>
          <FiChevronDown size={14} />
          Show Credentials ({(item as Project | Software).credentials!.length})
        </>
      )}
    </button>

    {visibleCredentials.has(item._id) && (
      <div className="bg-gray-50 rounded-xl p-3 space-y-3 border border-gray-200 mt-2 animate-[slideDown_0.3s_ease-out] max-h-64 overflow-y-auto">
        {(item as Project | Software).credentials!.map((cred, idx) => (
          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200 space-y-2">
            {cred.role && (
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 pb-2 border-b border-gray-200">
                {cred.role}
              </div>
            )}
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                Email
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                <code className="flex-1 text-xs font-mono text-gray-800 break-all">
                  {cred.email}
                </code>
                <button
                  className="text-gray-500 hover:text-gray-700 transition flex-shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(cred.email);
                    alert("Email copied!");
                  }}
                  title="Copy email"
                >
                  <FiCopy size={14} />
                </button>
              </div>
            </div>

            {cred.password && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <code className="flex-1 text-xs font-mono text-gray-800 break-all">
                    {visiblePasswords.has(`${item._id}-${idx}`)
                      ? cred.password
                      : "•".repeat(cred.password.length)}
                  </code>

                  <button
                    className="text-gray-500 hover:text-gray-700 transition flex-shrink-0"
                    onClick={() => togglePasswordVisibility(`${item._id}-${idx}`)}
                    title="Toggle password"
                  >
                    {visiblePasswords.has(`${item._id}-${idx}`) ? (
                      <FiEyeOff size={14} />
                    ) : (
                      <FiEye size={14} />
                    )}
                  </button>

                  <button
                    className="text-gray-500 hover:text-gray-700 transition flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(cred.password);
                      alert("Password copied!");
                    }}
                    title="Copy password"
                  >
                    <FiCopy size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}

          <div className="flex gap-2 mt-2">
            {type === "mobile-app" ? (
              <div className="flex gap-2 flex-1">
                {(item as MobileApp).iosLink && (
                  <button
                    className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    onClick={() =>
                      window.open((item as MobileApp).iosLink, "_blank")
                    }
                    title="Open on iOS"
                  >
                    iOS
                  </button>
                )}
                {(item as MobileApp).androidLink && (
                  <button
                    className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                    onClick={() =>
                      window.open((item as MobileApp).androidLink, "_blank")
                    }
                    title="Open on Android"
                  >
                    Android
                  </button>
                )}
              </div>
            ) : (
              <button
                className="flex-1 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-gradient-to-b from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 shadow-md"
                onClick={() =>
                  window.open(
                    (item as Project | Software | DigitalCard | MarketingClient)
                      .link,
                    "_blank",
                  )
                }
                title={`Open ${item.title}`}
              >
                {type === "software" ? "View" : "View"}
              </button>
            )}
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              onClick={() => handleShare(item, type)}
              title="Share this item"
            >
              📤
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <>
        <Head>
          <title>Portfolio Dashboard</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="flex flex-col items-center justify-center min-h-screen gap-5">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-base font-medium">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Portfolio Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      

      {!isUnlocked && (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-500 to-gray-900 p-5">
          <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full animate-[slideUp_0.5s_ease-out]">
            <style jsx>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            <div className="mb-10 flex justify-center">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                className="drop-shadow-lg"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="38"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                />
                <path d="M40 20L50 35H30L40 20Z" fill="url(#gradient)" />
                <circle cx="40" cy="50" r="8" fill="url(#gradient)" />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="80" y2="80">
                    <stop offset="0%" stopColor="black" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600 mb-10 text-base leading-relaxed">
              Enter your 4-digit PIN to access your portfolio
            </p>
            <div className="flex gap-3 justify-center mb-8">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  ref={(el) => {
                    if (el) pinRefs.current[i] = el;
                  }}
                  value={pinValues[i]}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !pinValues[i] && i > 0) {
                      pinRefs.current[i - 1]?.focus();
                    }
                  }}
                  type="password"
                  maxLength={1}
                  className="w-16 h-16 text-3xl font-bold text-center border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-900 transition-all focus:outline-none focus:border-gray-500 focus:bg-white focus:ring-4 focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={isSubmitting}
                />
              ))}
            </div>
            {pinError && (
              <div className="text-red-500 text-sm font-semibold min-h-6 mb-2 animate-[shake_0.5s_ease-in-out]">
                {pinError}
              </div>
            )}
            {isSubmitting && (
              <div className="text-indigo-600 text-sm font-semibold min-h-6 flex items-center justify-center gap-2">
                Verifying...
              </div>
            )}
          </div>
        </div>
      )}

      {showShareModal && shareItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Link</h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setShowShareModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-900">{shareItem.title}</div>
              {shareItem.description && (
                <div className="text-xs text-gray-600 mt-1 line-clamp-3">{shareItem.description}</div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors"
                onClick={() => shareOn("whatsapp")}
                title="WhatsApp"
              >
                <FaWhatsapp className="text-2xl" />
                <span className="text-xs font-semibold">WhatsApp</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-colors"
                onClick={() => shareOn("facebook")}
                title="Facebook"
              >
                <FaFacebook className="text-2xl" />
                <span className="text-xs font-semibold">Facebook</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 transition-colors"
                onClick={() => shareOn("twitter")}
                title="Twitter"
              >
                <FaTwitter className="text-2xl" />
                <span className="text-xs font-semibold">Twitter</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 transition-colors"
                onClick={() => shareOn("linkedin")}
                title="LinkedIn"
              >
                <FaLinkedin className="text-2xl" />
                <span className="text-xs font-semibold">LinkedIn</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 transition-colors"
                onClick={() => shareOn("telegram")}
                title="Telegram"
              >
                <FaTelegramPlane className="text-2xl" />
                <span className="text-xs font-semibold">Telegram</span>
              </button>
              <button
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                onClick={() => shareOn("copy")}
                title="Copy details"
              >
                <FiCopy className="text-2xl" />
                <span className="text-xs font-semibold">Copy</span>
              </button>
            </div>
            <div className="mt-4">
              <input
                type="text"
                readOnly
                value={
                  (shareType === "mobile-app"
                    ? (shareItem as any).androidLink ||
                      (shareItem as any).iosLink ||
                      (shareItem as any).link ||
                      ""
                    : (shareItem as any).link || "") || ""
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700"
              />
            </div>
          </div>
        </div>
      )}

      {isUnlocked && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <nav className="bg-gradient-to-b from-gray-900 to-gray-800 p-3 shadow-lg sticky top-0 z-50">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              {/* Left Section - Contact Info */}
              <div className="flex items-center gap-6 text-white text-sm font-medium">
                <div className="flex items-center gap-2">
                  <FiPhone className="text-white" />
                  <a href="tel:7016268071" className="hover:underline">
                    7016268071
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <FiMail className="text-white" />
                  <a
                    href="mailto:ravichovatiya96@gmail.com"
                    className="hover:underline"
                  >
                    ravichovatiya96@gmail.com
                  </a>
                </div>
              </div>

              {/* Right Section - Logout */}
              <button
                className="bg-gradient-to-b from-gray-900 to-gray-800 text-white border-2 border-white/30 px-4 py-1.5 rounded-lg cursor-pointer font-semibold text-sm transition-all hover:bg-white hover:text-white-900 hover:border-white hover:-translate-y-0.5 active:translate-y-0"
                onClick={handleLogout}
                title="Logout"
              >
                Logout
              </button>
            </div>
          </nav>
          {dataError && (
            <div className="flex items-center justify-between bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-xl mx-6 mt-6">
              <span className="text-red-600 font-semibold">⚠️ {dataError}</span>
              <button
                onClick={fetchData}
                className="bg-red-500 text-white border-none px-4 py-2 rounded-lg cursor-pointer font-semibold text-sm transition-colors hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          )}
          <div className="max-w-7xl mx-auto p-10 animate-[fadeIn_0.5s_ease-out]">
            <div className="mb-10">
              <div className="flex gap-3 flex-wrap pb-5 border-b-2 border-gray-200">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    className={`px-6 py-2 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                      t.key === activeTab
                        ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg"
                        : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gradient-to-b hover:from-gray-900 hover:to-gray-800 hover:text-white hover:border-gray-900 hover:-translate-y-0.5"
                    }`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingData && (
              <div className="flex flex-col items-center justify-center min-h-[300px] gap-5">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 text-base font-medium">
                  Loading content...
                </p>
              </div>
            )}

            {!isLoadingData && (
              <div key={activeTab} className="animate-[fadeIn_0.35s_ease-out]">
                {activeTab === "projects" && (
                  <div className="w-full">
                    {projects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {projects.map((p) => renderCard(p, "projects"))}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-600">
                        <p className="text-lg font-medium">No projects found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "mobile-app" && (
                  <div className="w-full">
                    {mobileApps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {mobileApps.map((app) => renderCard(app, "mobile-app"))}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-600">
                        <p className="text-lg font-medium">
                          No mobile apps found
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "software" && (
                  <div className="w-full">
                    {software.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {software.map((sw) => renderCard(sw, "software"))}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-600">
                        <p className="text-lg font-medium">No software found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "digital-card" && (
                  <div className="w-full">
                    {digitalCards.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {digitalCards.map((card) =>
                          renderCard(card, "digital-card"),
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-600">
                        <p className="text-lg font-medium">
                          No digital cards found
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "marketing-clients" && (
                  <div className="w-full">
                    {marketingClients.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {marketingClients.map((mc) =>
                          renderCard(mc, "marketing-clients"),
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-20 text-gray-600">
                        <p className="text-lg font-medium">
                          No marketing clients found
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
