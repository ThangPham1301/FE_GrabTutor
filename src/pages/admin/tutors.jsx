import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import statisticApi from "../../api/statisticApi";
import { 
  FaArrowLeft, FaCheck, FaTimes, FaCheckCircle, FaTimesCircle, FaStar, FaSpinner,
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaUniversity, FaGraduationCap, FaBook,
  FaChartBar, FaAward, FaFilter, FaSearch
} from "react-icons/fa";

const DEBUG = true;

export default function AdminTutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [selectedStars, setSelectedStars] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchTutors();
    fetchReviewStats();
  }, [pageNo, pageSize]);

  // ✅ FETCH TUTOR REQUESTS WITH ENRICHED DATA
  const fetchTutors = async () => {
    setLoading(true);
    try {
      if (DEBUG) console.log("📋 Fetching tutor requests...");
      
      const response = await userApi.getTutorRequests(pageNo, pageSize);
      
      if (DEBUG) console.log("📋 getTutorRequests Response:", response);
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      if (DEBUG) console.log("📋 Fetched tutor requests:", items.length);
      
      // ✅ ENRICH WITH TUTOR INFO
      const tutorsWithDetails = await Promise.all(
        items.map(async (tutor) => {
          try {
            if (DEBUG) console.log(`📊 Fetching details for userId: ${tutor.userId}`);
            
            const tutorInfoResponse = await userApi.getTutorInfo(tutor.userId);
            const tutorInfo = tutorInfoResponse?.data || tutorInfoResponse;
            
            if (DEBUG) console.log(`✅ Got tutorInfo for ${tutor.userId}:`, tutorInfo);
        
            // ✅ MERGE DATA - Prefer tutorInfo over getTutorRequests
            return {
              ...tutor,
              // From getTutorRequests
              requestId: tutor.requestId,
              status: tutor.status,
              
              // ✅ From getTutorInfo (PRIORITY - use these values)
              fullName: tutorInfo?.fullName || tutor.fullName || "N/A",
              email: tutorInfo?.email || tutor.email || "N/A",
              phoneNumber: tutorInfo?.phoneNumber || tutor.phoneNumber || "N/A",
              nationalId: tutorInfo?.nationalId || "N/A",
              
              // Education info
              major: tutorInfo?.major || "N/A",
              university: tutorInfo?.university || "N/A",
              highestAcademicDegree: tutorInfo?.highestAcademicDegree || "N/A",
              
              // Experience info
              averageStars: tutorInfo?.averageStars || 0,
              problemSolved: tutorInfo?.problemSolved || 0
            };
          } catch (err) {
            console.warn(`⚠️ Failed to fetch details for userId ${tutor.userId}:`, err);
            // ✅ Return request data if getTutorInfo fails
            return {
              ...tutor,
              requestId: tutor.requestId,
              status: tutor.status,
              major: "N/A",
              university: "N/A",
              highestAcademicDegree: "N/A",
              averageStars: 0,
              problemSolved: 0
            };
          }
        })
      );
      
      setTutors(tutorsWithDetails);
      setTotalPages(response.data?.totalPages || 0);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Unable to load tutor requests");
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH REVIEW STATS
  const fetchReviewStats = async () => {
    try {
      const response = await statisticApi.getReviewStars(0, 100);
      if (DEBUG) console.log("📊 Review stats:", response);
      setReviewStats(response?.data || response);
    } catch (err) {
      console.error("❌ Error fetching review stats:", err);
    }
  };

  // ✅ APPROVE TUTOR
  const handleApproveTutor = async (tutor) => {
    const requestId = tutor.requestId;
    
    if (!requestId) {
      alert("Error: requestId not found!");
      return;
    }
    
    const isApprovedStatus = tutor.status === "APPROVED" || tutor.active === true;
    if (isApprovedStatus) {
      alert("This tutor request has already been approved!");
      return;
    }
    
    if (window.confirm(`Approve tutor ${tutor.fullName}?`)) {
      try {
        await userApi.approveTutorRequest(requestId);
        alert("✅ Tutor approved successfully!");
        await fetchTutors();
      } catch (err) {
        alert("❌ Error approving tutor!");
        console.error("Approve error:", err);
      }
    }
  };

  // ✅ REJECT TUTOR
  const handleRejectTutor = async (tutor) => {
    if (!tutor.requestId) {
      alert("Error: requestId not found!");
      return;
    }
    
    const isApprovedStatus = tutor.status === "APPROVED" || tutor.active === true;
    if (isApprovedStatus) {
      alert("Cannot reject an already approved request!");
      return;
    }
    
    setSelectedTutor(tutor);
    setShowModal(true);
  };

  const confirmReject = async () => {
    try {
      const requestId = selectedTutor.requestId;
      await userApi.rejectTutorRequest(requestId, rejectReason);
      alert("✅ Tutor rejected successfully!");
      setShowModal(false);
      setRejectReason("");
      await fetchTutors();
    } catch (err) {
      alert("❌ Error rejecting tutor!");
      console.error("Reject error:", err);
    }
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const isPending = (tutor) => {
    return tutor.status === "PENDING" || (!tutor.status && !tutor.active);
  };

  const isApproved = (tutor) => {
    return tutor.status === "APPROVED" || tutor.active === true;
  };

  const hasData = (value) => {
    return value && value !== "N/A" && value !== "";
  };

  // ✅ FILTER TUTORS
  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = 
      tutor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.phoneNumber?.includes(searchQuery);
    
    const matchesStars = selectedStars === null || Math.round(tutor.averageStars || 0) === selectedStars;
    
    return matchesSearch && matchesStars;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-5xl text-[#03ccba]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
            >
              <FaArrowLeft /> Back
            </button>
            <h1 className="text-4xl font-bold">👨‍🎓 Tutor Management</h1>
          </div>
          <p className="text-teal-100 text-lg">Manage and approve tutor applications</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* ==================== FILTERS ==================== */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow">
            <FaSearch className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageNo(0);
              }}
              className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Star Filter */}
          {reviewStats && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-[#03ccba]" size={18} />
                <h3 className="text-lg font-bold text-gray-900">Filter by Rating</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <button
                  onClick={() => {
                    setSelectedStars(null);
                    setPageNo(0);
                  }}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    selectedStars === null
                      ? "bg-[#03ccba] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({filteredTutors.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => {
                      setSelectedStars(stars);
                      setPageNo(0);
                    }}
                    className={`p-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      selectedStars === stars
                        ? "bg-[#03ccba] text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {[...Array(stars)].map((_, i) => (
                      <FaStar key={i} size={14} />
                    ))}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==================== TUTORS TABLE ==================== */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">No.</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">User Info</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Education</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTutors.length > 0 ? (
                  filteredTutors.map((tutor, index) => (
                    <tr 
                      key={tutor.id || tutor.userId || index} 
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {/* No. */}
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {pageNo * pageSize + index + 1}
                      </td>

                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {tutor.fullName?.charAt(0).toUpperCase() || "T"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {tutor.fullName && tutor.fullName !== "N/A" ? tutor.fullName : "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {tutor.email && tutor.email !== "N/A" ? tutor.email : "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <FaPhone size={12} className="text-[#03ccba]" />
                            <span className="text-gray-700 font-medium">
                              {tutor.phoneNumber && tutor.phoneNumber !== "N/A" 
                                ? tutor.phoneNumber 
                                : "N/A"}
                            </span>
                          </div>
                          {hasData(tutor.nationalId) && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaIdCard size={12} className="text-gray-500" />
                              <span className="text-gray-600 truncate">
                                {tutor.nationalId}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Education */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {hasData(tutor.major) && (
                            <div className="flex items-center gap-2">
                              <FaBook size={12} className="text-blue-500" />
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                {tutor.major}
                              </span>
                            </div>
                          )}
                          {hasData(tutor.highestAcademicDegree) && (
                            <div className="flex items-center gap-2">
                              <FaGraduationCap size={12} className="text-yellow-500" />
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                {tutor.highestAcademicDegree}
                              </span>
                            </div>
                          )}
                          {hasData(tutor.university) && (
                            <div className="flex items-center gap-1">
                              <FaUniversity size={12} className="text-purple-500" />
                              <span className="text-xs text-gray-700 truncate">
                                {tutor.university}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  size={14}
                                  className={
                                    i < Math.round(tutor.averageStars || 0)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                            <span className="font-bold text-yellow-600">
                              {(tutor.averageStars || 0).toFixed(1)}
                            </span>
                          </div>
                          
                          {/* Problems Solved */}
                          <div className="flex items-center gap-2">
                            <FaChartBar size={12} className="text-green-500" />
                            <span className="text-sm font-bold text-green-600">
                              {tutor.problemSolved || 0} solved
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isPending(tutor) ? (
                          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold inline-flex items-center gap-1">
                            ⏳ Pending
                          </span>
                        ) : isApproved(tutor) ? (
                          <div className="inline-flex items-center gap-2">
                            <FaCheckCircle className="text-green-600 text-lg" />
                            <span className="text-xs font-bold text-green-600">Approved</span>
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                            {tutor.status || "Pending"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {isPending(tutor) ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveTutor(tutor)}
                              className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-all flex items-center gap-1"
                              title="Approve this tutor"
                            >
                              <FaCheck size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectTutor(tutor)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1"
                              title="Reject this tutor"
                            >
                              <FaTimes size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 font-semibold">
                            {isApproved(tutor) ? "Approved" : "Processed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <FaUser className="text-gray-300 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {searchQuery ? "No tutors match your search" : "No tutor requests found"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 px-6 py-6 border-t border-gray-200">
              <button
                onClick={handlePrevPage}
                disabled={pageNo === 0}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-all font-semibold"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 font-bold text-gray-700 bg-gray-100 rounded-lg">
                Page {pageNo + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pageNo >= totalPages - 1}
                className="px-4 py-2 bg-[#03ccba] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02b5a5] transition-all font-semibold"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== REJECT MODAL ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <FaTimesCircle className="text-red-600 text-2xl" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Reject Tutor
            </h2>
            
            <p className="text-gray-600 text-center mb-4">
              Are you sure you want to reject{" "}
              <strong>{selectedTutor?.fullName}</strong>?
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection (optional)..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 mb-4"
              rows={4}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                <FaTimes /> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}