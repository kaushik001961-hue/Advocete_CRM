"use client";

import { useState } from "react";
import { User, Save, Lock } from "lucide-react";

interface AdvocateProfile {
  fullName: string;
  barNumber: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  address: string;
}

const DEFAULT_PROFILE: AdvocateProfile = {
  fullName: "Adv. Rahul Sharma",
  barNumber: "MAH/4892/2018",
  email: "advocate1@crm.com",
  phone: "+91 98765 00112",
  specialization: "Civil & Corporate Litigation",
  experience: "8 Years",
  address: "Chamber 204, High Court Annexe Building",
};

function getSavedProfile(): AdvocateProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  const savedProfile = localStorage.getItem("advocate_profile");

  if (!savedProfile) {
    return DEFAULT_PROFILE;
  }

  try {
    const data: unknown = JSON.parse(savedProfile);

    if (!data || typeof data !== "object") {
      return DEFAULT_PROFILE;
    }

    const profile = data as Partial<AdvocateProfile>;

    return {
      fullName: DEFAULT_PROFILE.fullName,
      barNumber: DEFAULT_PROFILE.barNumber,
      email:
        typeof profile.email === "string"
          ? profile.email
          : DEFAULT_PROFILE.email,
      phone:
        typeof profile.phone === "string"
          ? profile.phone
          : DEFAULT_PROFILE.phone,
      specialization:
        typeof profile.specialization === "string"
          ? profile.specialization
          : DEFAULT_PROFILE.specialization,
      experience:
        typeof profile.experience === "string"
          ? profile.experience
          : DEFAULT_PROFILE.experience,
      address:
        typeof profile.address === "string"
          ? profile.address
          : DEFAULT_PROFILE.address,
    };
  } catch (err) {
    console.error("Failed to parse saved profile", err);
    return DEFAULT_PROFILE;
  }
}

export default function AdvocateProfilePage() {
  const [initialProfile] = useState<AdvocateProfile>(() =>
    getSavedProfile()
  );

  const [fullName] = useState(initialProfile.fullName);
  const [barNumber] = useState(initialProfile.barNumber);

  const [email, setEmail] = useState(initialProfile.email);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [specialization, setSpecialization] = useState(
    initialProfile.specialization
  );
  const [experience, setExperience] = useState(initialProfile.experience);
  const [address, setAddress] = useState(initialProfile.address);

  const [successMessage, setSuccessMessage] = useState("");

  const getInitials = (name: string) => {
    const cleanName = name
      .replace(/^Adv\.\s*/i, "")
      .trim();

    const parts = cleanName.split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return cleanName.substring(0, 2).toUpperCase();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const profileData: AdvocateProfile = {
      fullName,
      barNumber,
      email,
      phone,
      specialization,
      experience,
      address,
    };

    localStorage.setItem(
      "advocate_profile",
      JSON.stringify(profileData)
    );

    setSuccessMessage("Profile changes saved successfully!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Banner with Dynamic Name and Initials */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center text-xl shadow-md shrink-0">
          {getInitials(fullName)}
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {fullName}
          </h1>

          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Verified Bar Advocate • {barNumber}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-3 rounded-xl font-medium">
          {successMessage}
        </div>
      )}

      {/* Professional Details Form */}
      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5"
      >
        <div className="border-b pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="text-blue-600" size={18} />

            <h2 className="text-sm font-bold text-gray-900">
              Professional Details
            </h2>
          </div>

          <span className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1 font-medium">
            <Lock size={12} />
            Name & Bar No. managed by Superadmin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
              Full Name
              <span className="text-[10px] text-gray-400 font-normal">
                Read-only
              </span>
            </label>

            <input
              type="text"
              value={fullName}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg text-xs cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
              Bar Council Registration No.
              <span className="text-[10px] text-gray-400 font-normal">
                Read-only
              </span>
            </label>

            <input
              type="text"
              value={barNumber}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg text-xs cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phone Number
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Primary Specialization
            </label>

            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Legal Experience
            </label>

            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Chamber / Office Address
          </label>

          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-end pt-3 border-t">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <Save size={16} />
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}