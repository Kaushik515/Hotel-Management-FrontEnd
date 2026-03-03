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
    if (!user?._id) {
      navigate("/login");
      return;
    }
    fetchBookings(user._id);
  }, [user, navigate]);

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
        {error && user?._id && (
          <button className="retryButton" onClick={() => fetchBookings(user._id)}>
            Retry
          </button>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p>No bookings found.</p>
        )}

        {!loading &&
          !error &&
          bookings.map((booking) => (
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
            </div>
          ))}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;
