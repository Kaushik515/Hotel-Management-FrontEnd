import "./myBookings.css";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { AuthContext } from "../../context/AuthContext";

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [submittingReviewId, setSubmittingReviewId] = useState("");
  const [generatingReviewId, setGeneratingReviewId] = useState("");

  const fetchBookings = async (userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/bookings/user/${userId}`);
      setBookings(res.data);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError("Session expired. Please login again.");
      } else {
        setError(err?.response?.data?.message || "Could not load bookings.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const currentUserId = user?._id || user?.id;
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    fetchBookings(currentUserId);
  }, [user, navigate]);

  const getBookingEndDate = (dates = []) => {
    if (!Array.isArray(dates) || dates.length === 0) return null;
    const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b));
    return new Date(sortedDates[sortedDates.length - 1]);
  };

  const getBookingOutcome = (booking) => {
    const endDate = getBookingEndDate(booking.dates);
    const isCancelled = booking.status === "cancelled";
    const hasEnded = endDate ? endDate < startOfToday : false;

    if (isCancelled) return "cancelled";
    if (hasEnded) return "completed";
    return "active";
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const activeBookings = bookings.filter((booking) => {
    return getBookingOutcome(booking) === "active";
  });

  const pastBookings = bookings.filter((booking) => {
    const outcome = getBookingOutcome(booking);
    return outcome === "cancelled" || outcome === "completed";
  });

  const filteredPastBookings = pastBookings.filter((booking) => {
    const isCancelled = booking.status === "cancelled";
    const isCompleted = !isCancelled;

    if (historyFilter === "cancelled") return isCancelled;
    if (historyFilter === "completed") return isCompleted;
    return true;
  });

  const handleReviewChange = (bookingId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [bookingId]: {
        ...(prev[bookingId] || { rating: 5, review: "" }),
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (bookingId) => {
    const draft = reviewDrafts[bookingId] || { rating: 5, review: "" };
    const rating = Number(draft.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      alert("Please select a valid rating from 1 to 5.");
      return;
    }

    setSubmittingReviewId(bookingId);
    try {
      const res = await axios.put(`/api/bookings/${bookingId}/review`, {
        rating,
        review: (draft.review || "").trim(),
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? { ...booking, ...res.data } : booking
        )
      );

      setReviewDrafts((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Could not submit review.");
    }
    setSubmittingReviewId("");
  };

  const handleGenerateReviewWithAi = async (booking) => {
    const bookingId = booking._id;
    const draft = reviewDrafts[bookingId] || { rating: 5, review: "" };

    setGeneratingReviewId(bookingId);
    try {
      const res = await axios.post("/api/ai/review-draft", {
        hotelName: booking.hotelName,
        dateRange: formatDateRange(booking.dates),
        rating: Number(draft.rating || 5),
        notes: draft.review || "",
      });

      setReviewDrafts((prev) => ({
        ...prev,
        [bookingId]: {
          ...(prev[bookingId] || { rating: 5, review: "" }),
          review: res.data?.draft || prev[bookingId]?.review || "",
        },
      }));
    } catch (err) {
      alert(err?.response?.data?.message || "Could not generate AI review draft.");
    }
    setGeneratingReviewId("");
  };

  const renderReviewSection = (booking) => {
    const outcome = getBookingOutcome(booking);

    if (booking.rating) {
      return (
        <div className="bookingReviewBlock">
          <h4 className="bookingReviewTitle">Your Rating & Review</h4>
          <p className="bookingReviewStars">{"★".repeat(booking.rating)}{"☆".repeat(5 - booking.rating)}</p>
          <p className="bookingReviewText">
            {booking.review ? booking.review : "No written review provided."}
          </p>
        </div>
      );
    }

    if (outcome === "cancelled") {
      return (
        <div className="bookingReviewBlock">
          <h4 className="bookingReviewTitle">Your Rating & Review</h4>
          <p className="bookingReviewHint">Review is unavailable for cancelled bookings.</p>
        </div>
      );
    }

    if (outcome === "active") {
      return (
        <div className="bookingReviewBlock">
          <h4 className="bookingReviewTitle">Your Rating & Review</h4>
          <p className="bookingReviewHint">Review will be enabled after your stay is completed.</p>
        </div>
      );
    }

    return (
      <div className="bookingReviewBlock">
        <h4 className="bookingReviewTitle">Your Rating & Review</h4>
        <div className="bookingReviewForm">
          <label>
            Rating
            <select
              value={reviewDrafts[booking._id]?.rating || 5}
              onChange={(e) =>
                handleReviewChange(booking._id, "rating", Number(e.target.value))
              }
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </label>

          <label>
            Review
            <textarea
              rows={3}
              placeholder="Share your stay experience (optional)"
              value={reviewDrafts[booking._id]?.review || ""}
              onChange={(e) =>
                handleReviewChange(booking._id, "review", e.target.value)
              }
            />
          </label>

          <button
            className="submitReviewButton"
            onClick={() => handleSubmitReview(booking._id)}
            disabled={submittingReviewId === booking._id}
            type="button"
          >
            {submittingReviewId === booking._id ? "Submitting..." : "Submit Review"}
          </button>

          <button
            className="generateReviewButton"
            onClick={() => handleGenerateReviewWithAi(booking)}
            disabled={generatingReviewId === booking._id}
            type="button"
          >
            {generatingReviewId === booking._id ? "Generating..." : "Generate with AI"}
          </button>
        </div>
      </div>
    );
  };

  const formatDateRange = (dates) => {
    if (!dates || dates.length === 0) return "N/A";
    const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b));
    const startDate = new Date(sortedDates[0]).toLocaleDateString();
    const endDate = new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };

  const handleCancel = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Could not cancel booking.");
    }
  };

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="myBookingsContainer">
        <h1 className="myBookingsTitle">My Bookings</h1>

        {loading && <p>Loading bookings...</p>}
        {error && <p className="myBookingsError">{error}</p>}
        {error && (user?._id || user?.id) && (
          <button className="retryButton" onClick={() => fetchBookings(user?._id || user?.id)}>
            Retry
          </button>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p>No bookings found.</p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <>
            <h2 className="bookingSectionTitle">Active / Upcoming</h2>
            {activeBookings.length === 0 && (
              <p className="bookingSectionEmpty">No active bookings.</p>
            )}

            {activeBookings.map((booking) => (
              <div className="bookingCard" key={booking._id}>
                <div className="bookingRow">
                  <span>Hotel</span>
                  <b>{booking.hotelName}</b>
                </div>
                <div className="bookingRow">
                  <span>Dates</span>
                  <b>{formatDateRange(booking.dates)}</b>
                </div>
                <div className="bookingRow">
                  <span>Rooms</span>
                  <b>{booking.roomNumberIds.length}</b>
                </div>
                <div className="bookingRow">
                  <span>Total</span>
                  <b>${booking.totalPrice}</b>
                </div>
                <div className="bookingRow">
                  <span>Status</span>
                  <b className={booking.status === "cancelled" ? "cancelled" : "confirmed"}>
                    {booking.status}
                  </b>
                </div>
                {booking.status !== "cancelled" && (
                  <button
                    className="cancelBookingButton"
                    onClick={() => handleCancel(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}

                {renderReviewSection(booking)}
              </div>
            ))}

            <h2 className="bookingSectionTitle">Past Bookings (History)</h2>
            {pastBookings.length > 0 && (
              <div className="historyFilters">
                <button
                  type="button"
                  className={`historyFilterButton ${historyFilter === "all" ? "active" : ""}`}
                  onClick={() => setHistoryFilter("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`historyFilterButton ${historyFilter === "completed" ? "active" : ""}`}
                  onClick={() => setHistoryFilter("completed")}
                >
                  Completed
                </button>
                <button
                  type="button"
                  className={`historyFilterButton ${historyFilter === "cancelled" ? "active" : ""}`}
                  onClick={() => setHistoryFilter("cancelled")}
                >
                  Cancelled
                </button>
              </div>
            )}

            {pastBookings.length === 0 && (
              <p className="bookingSectionEmpty">No past bookings yet.</p>
            )}

            {pastBookings.length > 0 && filteredPastBookings.length === 0 && (
              <p className="bookingSectionEmpty">No bookings in this filter.</p>
            )}

            {filteredPastBookings.map((booking) => (
              <div className="bookingCard bookingCardPast" key={booking._id}>
                <div className="bookingRow">
                  <span>Hotel</span>
                  <b>{booking.hotelName}</b>
                </div>
                <div className="bookingRow">
                  <span>Dates</span>
                  <b>{formatDateRange(booking.dates)}</b>
                </div>
                <div className="bookingRow">
                  <span>Rooms</span>
                  <b>{booking.roomNumberIds.length}</b>
                </div>
                <div className="bookingRow">
                  <span>Total</span>
                  <b>${booking.totalPrice}</b>
                </div>
                <div className="bookingRow">
                  <span>Status</span>
                  <b className={booking.status === "cancelled" ? "cancelled" : "confirmed"}>
                    {booking.status === "cancelled" ? "cancelled" : "completed"}
                  </b>
                </div>

                {renderReviewSection(booking)}
              </div>
            ))}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;
