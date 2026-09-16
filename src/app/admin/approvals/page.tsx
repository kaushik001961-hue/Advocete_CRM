"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Briefcase,
  AlertCircle
} from "lucide-react";

interface PendingAdvocate {
  id: string;
  fullName: string;
  barNumber: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  address: string;
  submittedAt: string;
  documents: {
    sanad: string;
    aadhaar: string;
    pan: string;
    llbDegree: string;
  };
}

export default function SuperadminAdvocateApprovalsPage() {
  // Mock data representing advocates waiting for approval with their 4 mandatory documents
  const [pendingList, setPendingList] = useState<PendingAdvocate[]>([
    {
      id: "adv_101",
      fullName: "Adv. Rajesh Kumar",
      barNumber: "MAH/7821/2021",
      email: "rajesh.kumar@lawfirm.com",
      phone: "+91 98111 22334",
      specialization: "Criminal & Constitutional Law",
      experience: "5 Years",
      address: "Chamber 402, Sessions Court Compound, Mumbai",
      submittedAt: "2026-09-02 10:15 AM",
      documents: {
        sanad: "sanad_rajesh_kumar.pdf",
        aadhaar: "aadhaar_rajesh.pdf",
        pan: "pan_rajesh.pdf",
        llbDegree: "llb_degree_rajesh.pdf"
      }
    },
    {
      id: "adv_102",
      fullName: "Adv. Sneha Deshmukh",
      barNumber: "DL/3412/2019",
      email: "sneha.advocate@legaltech.in",
      phone: "+91 97222 33445",
      specialization: "Corporate & IP Litigation",
      experience: "7 Years",
      address: "Suite 12, High Court Enclave, New Delhi",
      submittedAt: "2026-09-01 04:40 PM",
      documents: {
        sanad: "sanad_sneha.pdf",
        aadhaar: "aadhaar_sneha.pdf",
        pan: "pan_sneha.pdf",
        llbDegree: "llb_degree_sneha.pdf"
      }
    }
  ]);

  const [selectedAdvocate, setSelectedAdvocate] = useState<PendingAdvocate | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleApprove = (id: string, name: string) => {
    setPendingList((prev) => prev.filter((item) => item.id !== id));
    setSelectedAdvocate(null);
    setNotification({
      type: "success",
      message: `Successfully approved ${name}. Account credentials are now active for login.`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReject = (id: string, name: string) => {
    setPendingList((prev) => prev.filter((item) => item.id !== id));
    setSelectedAdvocate(null);
    setNotification({
      type: "error",
      message: `Application for ${name} has been rejected due to compliance mismatch.`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleViewDocument = (docName: string) => {
    // In a real application, this opens a secure modal preview or downloads the file from your backend storage
    alert(`Opening secure preview for document: ${docName}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-400" size={24} />
            <h1 className="text-xl font-bold">Superadmin Verification & Approvals</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Review advocate self-registrations and inspect mandatory compliance files before granting platform access.
          </p>
        </div>
        <div className="bg-blue-600/30 border border-blue-400/30 text-blue-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2">
          <Clock size={16} /> Pending Reviews: <span className="text-white font-bold">{pendingList.length}</span>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 border ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-rose-50 text-rose-700 border-rose-200"
        }`}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {notification.message}
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Requests List */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide border-b pb-2">
            Pending Applications
          </h2>

          {pendingList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs space-y-2">
              <CheckCircle2 className="mx-auto text-emerald-500" size={32} />
              <p>All advocate applications have been reviewed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map((adv) => (
                <div
                  key={adv.id}
                  onClick={() => setSelectedAdvocate(adv)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col space-y-2 ${
                    selectedAdvocate?.id === adv.id
                      ? "border-blue-600 bg-blue-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900">{adv.fullName}</h3>
                    <span className="text-[10px] font-mono text-blue-600 font-semibold">{adv.barNumber}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{adv.email}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-400">
                    <span>Submitted: {adv.submittedAt.split(" ")[0]}</span>
                    <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Action Required
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Inspection Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          {selectedAdvocate ? (
            <>
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <UserCheck className="text-blue-600" size={18} /> Advocate Application Review
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Review profile details and verify mandatory credentials below.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(selectedAdvocate.id, selectedAdvocate.fullName)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition flex items-center gap-1 border border-rose-200"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedAdvocate.id, selectedAdvocate.fullName)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 size={14} /> Approve & Enable Login
                  </button>
                </div>
              </div>

              {/* Profile Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-gray-400 block">Full Legal Name</span>
                  <strong className="text-gray-800">{selectedAdvocate.fullName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Bar Council Registration No.</span>
                  <strong className="text-blue-600 font-mono">{selectedAdvocate.barNumber}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Email Address</span>
                  <strong className="text-gray-800">{selectedAdvocate.email}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Phone Number</span>
                  <strong className="text-gray-800">{selectedAdvocate.phone}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Primary Specialization</span>
                  <strong className="text-gray-800">{selectedAdvocate.specialization}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Legal Experience</span>
                  <strong className="text-gray-800">{selectedAdvocate.experience}</strong>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-400 block">Chamber / Office Address</span>
                  <strong className="text-gray-800">{selectedAdvocate.address}</strong>
                </div>
              </div>

              {/* 4 Mandatory Documents Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <FileText className="text-blue-600" size={16} /> Uploaded Mandatory Compliance Files (4/4)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Sanad */}
                  <div className="p-3 border border-gray-200 rounded-xl flex items-center justify-between bg-white shadow-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-600" size={18} />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Sanad Certificate</p>
                        <p className="text-[10px] text-gray-400">{selectedAdvocate.documents.sanad}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDocument(selectedAdvocate.documents.sanad)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      <Eye size={13} /> View
                    </button>
                  </div>

                  {/* Aadhaar */}
                  <div className="p-3 border border-gray-200 rounded-xl flex items-center justify-between bg-white shadow-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-600" size={18} />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Aadhaar Card</p>
                        <p className="text-[10px] text-gray-400">{selectedAdvocate.documents.aadhaar}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDocument(selectedAdvocate.documents.aadhaar)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      <Eye size={13} /> View
                    </button>
                  </div>

                  {/* PAN */}
                  <div className="p-3 border border-gray-200 rounded-xl flex items-center justify-between bg-white shadow-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-600" size={18} />
                      <div>
                        <p className="text-xs font-bold text-gray-800">PAN Card</p>
                        <p className="text-[10px] text-gray-400">{selectedAdvocate.documents.pan}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDocument(selectedAdvocate.documents.pan)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      <Eye size={13} /> View
                    </button>
                  </div>

                  {/* LLB Degree */}
                  <div className="p-3 border border-gray-200 rounded-xl flex items-center justify-between bg-white shadow-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-600" size={18} />
                      <div>
                        <p className="text-xs font-bold text-gray-800">LLB Degree Certificate</p>
                        <p className="text-[10px] text-gray-400">{selectedAdvocate.documents.llbDegree}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDocument(selectedAdvocate.documents.llbDegree)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      <Eye size={13} /> View
                    </button>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400 text-xs space-y-2">
              <Briefcase className="mx-auto text-gray-300" size={40} />
              <p>Select an advocate application from the left panel to inspect details and documents.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}