"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, UploadCloud, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdvocateSelfRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    barNumber: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    address: "",
    password: "",
  });

  const [files, setFiles] = useState<{
    sanad: File | null;
    aadhaar: File | null;
    pan: File | null;
    llbDegree: File | null;
  }>({
    sanad: null,
    aadhaar: null,
    pan: null,
    llbDegree: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: "sanad" | "aadhaar" | "pan" | "llbDegree") => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [fileKey]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate all 4 mandatory files
    if (!files.sanad || !files.aadhaar || !files.pan || !files.llbDegree) {
      setError("Compliance Error: All 4 documents (Sanad, Aadhaar, PAN, and LLB Degree Certificate) are mandatory.");
      return;
    }

    setLoading(true);

    try {
      const submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submissionData.append(key, value);
      });
      submissionData.append("sanad", files.sanad);
      submissionData.append("aadhaar", files.aadhaar);
      submissionData.append("pan", files.pan);
      submissionData.append("llbDegree", files.llbDegree);

      // Simulating API backend request
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      setError("Registration failed. Please check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg">
              <Scale size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Legal CRM Portal</h1>
              <p className="text-xs text-slate-400">Advocate Self-Registration & Verification</p>
            </div>
          </div>
          <Link
            href="/auth/login"
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" /> Registration successful! Documents submitted for admin verification. Redirecting...
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
          
          {/* Section 1: Professional Details */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4">1. Professional & Contact Details (Mandatory)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Adv. Rahul Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bar Council Registration No. <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="barNumber"
                  value={formData.barNumber}
                  onChange={handleChange}
                  placeholder="e.g. MAH/4892/2018"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="advocate@crm.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 00112"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Civil & Corporate Litigation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Legal Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 8 Years"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Chamber / Office Address <span className="text-rose-500">*</span></label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete chamber or office address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Create Secure Password <span className="text-rose-500">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Section 2: Mandatory 4 Documents */}
          <div>
            <div className="border-b pb-2 mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">2. Mandatory Compliance Documents (All 4 Required)</h2>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                REQUIRED FOR APPROVAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Sanad */}
              <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center space-y-2 hover:border-blue-400 transition bg-slate-50/50">
                <UploadCloud className="mx-auto text-blue-600" size={22} />
                <div>
                  <p className="text-xs font-bold text-gray-800">Sanad Certificate <span className="text-rose-500">*</span></p>
                  <p className="text-[10px] text-gray-400">PDF, JPG or PNG (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "sanad")}
                  className="text-[11px] w-full text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  required
                />
                {files.sanad && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <FileText size={12} /> {files.sanad.name}
                  </p>
                )}
              </div>

              {/* 2. Aadhaar */}
              <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center space-y-2 hover:border-blue-400 transition bg-slate-50/50">
                <UploadCloud className="mx-auto text-blue-600" size={22} />
                <div>
                  <p className="text-xs font-bold text-gray-800">Aadhaar Card <span className="text-rose-500">*</span></p>
                  <p className="text-[10px] text-gray-400">PDF, JPG or PNG (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "aadhaar")}
                  className="text-[11px] w-full text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  required
                />
                {files.aadhaar && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <FileText size={12} /> {files.aadhaar.name}
                  </p>
                )}
              </div>

              {/* 3. PAN */}
              <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center space-y-2 hover:border-blue-400 transition bg-slate-50/50">
                <UploadCloud className="mx-auto text-blue-600" size={22} />
                <div>
                  <p className="text-xs font-bold text-gray-800">PAN Card <span className="text-rose-500">*</span></p>
                  <p className="text-[10px] text-gray-400">PDF, JPG or PNG (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "pan")}
                  className="text-[11px] w-full text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  required
                />
                {files.pan && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <FileText size={12} /> {files.pan.name}
                  </p>
                )}
              </div>

              {/* 4. LLB Degree Certificate */}
              <div className="border-2 border-dashed border-gray-200 p-4 rounded-xl text-center space-y-2 hover:border-blue-400 transition bg-slate-50/50">
                <UploadCloud className="mx-auto text-blue-600" size={22} />
                <div>
                  <p className="text-xs font-bold text-gray-800">LLB Degree Certificate <span className="text-rose-500">*</span></p>
                  <p className="text-[10px] text-gray-400">PDF, JPG or PNG (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, "llbDegree")}
                  className="text-[11px] w-full text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  required
                />
                {files.llbDegree && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <FileText size={12} /> {files.llbDegree.name}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t flex items-center justify-between">
            <p className="text-[11px] text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition shadow-md disabled:opacity-50"
            >
              {loading ? "Submitting Registration..." : "Submit Advocate Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}