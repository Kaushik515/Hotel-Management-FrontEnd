import "./aiTripPlanner.css";
import { useState } from "react";
import axios from "axios";

const starterPrompts = [
  "Plan a 3-day budget trip in Goa",
  "Suggest a family-friendly stay under ₹5000/night",
  "I want a mountain destination this weekend",
];

const formatAiReplyToHtml = (text = "") => {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
};

const AiTripPlanner = () => {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async (question) => {
    const prompt = (question || message).trim();
    if (!prompt) return;

    setLoading(true);
    setError("");
    setReply("");

    try {
      const res = await axios.post("/api/ai/trip-plan", { message: prompt });
      setReply(res.data?.reply || "No response generated.");
      setMessage(prompt);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not generate AI suggestions. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <section className="aiTripPlanner">
      <div className="aiTripPlannerHeader">
        <h2>AI Trip Planner</h2>
        <p>Ask for destination ideas, budget stays, and quick booking tips.</p>
      </div>

      <div className="aiPromptRow">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="aiPromptButton"
            onClick={() => handleAsk(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="aiInputRow">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Example: Suggest 2 couple-friendly hotels in Manali under ₹6000 with best time to visit"
        />
        <button type="button" onClick={() => handleAsk()} disabled={loading}>
          {loading ? "Generating..." : "Get AI Suggestions"}
        </button>
      </div>

      {error && <p className="aiError">{error}</p>}

      {reply && (
        <div className="aiReplyCard">
          <h3>Here are your suggestions:</h3>
          <div
            className="aiReplyText"
            dangerouslySetInnerHTML={{ __html: formatAiReplyToHtml(reply) }}
          />
        </div>
      )}
    </section>
  );
};

export default AiTripPlanner;
