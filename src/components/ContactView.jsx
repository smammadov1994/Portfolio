import React, { useEffect, useMemo, useRef, useState } from "react";
import me from "../../me.json";
import "./ContactView.css";

const ContactView = ({ onClose }) => {
  const toEmail = me?.personal?.contact?.email || "";
  const sendEndpoint =
    import.meta.env.VITE_CONTACT_API_URL || "/api/send-email";

  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessFlash, setSendSuccessFlash] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" }); // success|error|info
  const [touched, setTouched] = useState({
    fromEmail: false,
    subject: false,
    message: false,
  });
  const closeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const isValidEmail = (value) => {
    // Simple, practical email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  };

  const validity = useMemo(() => {
    const fromOk = isValidEmail(fromEmail);
    const subjectOk = subject.trim().length > 0;
    const messageOk = message.trim().length > 0;
    return {
      fromOk,
      subjectOk,
      messageOk,
      allOk: fromOk && subjectOk && messageOk,
    };
  }, [fromEmail, subject, message]);

  const handleSend = async () => {
    setStatus({ type: "", text: "" });

    setTouched({ fromEmail: true, subject: true, message: true });

    if (!validity.allOk) {
      setStatus({
        type: "error",
        text: "Please fix the highlighted fields before sending.",
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(sendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEmail: fromEmail.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        const err =
          data?.error ||
          (typeof data?.body === "string" ? data.body : "") ||
          `Request failed (${res.status})`;
        throw new Error(err);
      }

      setStatus({
        type: "success",
        text: "Sent. Thanks — I’ll get back to you soon.",
      });
      setSendSuccessFlash(true);
      window.setTimeout(() => setSendSuccessFlash(false), 900);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => {
        if (typeof onClose === "function") onClose();
      }, 1500);
      setSubject("");
      setMessage("");
      setFromEmail("");
      setTouched({ fromEmail: false, subject: false, message: false });
    } catch (e) {
      setStatus({
        type: "error",
        text:
          e instanceof Error
            ? `Couldn’t send yet: ${e.message}`
            : "Couldn’t send yet.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="contact-view">
      <div className="contact-header">
        <div className="contact-info">
          <h2>Contact</h2>
          <p className="contact-subtitle">
            Write a note and I’ll get back to you.
          </p>
        </div>
      </div>

      <div className="contact-form glass-panel-sm">
        <div className="contact-row">
          <div className="contact-label">To</div>
          <div className="contact-value">{toEmail || "—"}</div>
        </div>

        <label className="contact-field">
          <span className="contact-label">Your email</span>
          <input
            className={`contact-input ${
              touched.fromEmail
                ? validity.fromOk
                  ? "is-valid"
                  : "is-invalid"
                : ""
            }`}
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, fromEmail: true }))}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="contact-field">
          <span className="contact-label">Subject</span>
          <input
            className={`contact-input ${
              touched.subject
                ? validity.subjectOk
                  ? "is-valid"
                  : "is-invalid"
                : ""
            }`}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
            placeholder="Say hello…"
            required
          />
        </label>

        <label className="contact-field">
          <span className="contact-label">Message</span>
          <textarea
            className={`contact-textarea ${
              touched.message
                ? validity.messageOk
                  ? "is-valid"
                  : "is-invalid"
                : ""
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, message: true }))}
            placeholder="Write your message here…"
            rows={8}
            required
          />
        </label>

        <div className="contact-actions">
          <button
            className="action-btn secondary"
            type="button"
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              "Sending…"
            ) : sendSuccessFlash ? (
              <span className="send-check" aria-label="Sent">
                <svg
                  className="send-check-icon"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M22.027 9.07c-.479-.28-1.09-.11-1.366.36l-6.395 11.08-3.578-3.3a1 1 0 0 0-1.414 1.42l4.572 4.22a1 1 0 0 0 1.367-.04c.122-.11 7.18-12.41 7.18-12.41.276-.47.112-1.09-.366-1.36ZM16 30C8.268 30 2 23.73 2 16S8.268 2 16 2s14 6.27 14 14-6.268 14-14 14Z" />
                </svg>
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>

        {status.text ? (
          <div
            className={`contact-status contact-status--${
              status.type || "info"
            }`}
          >
            {status.text}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ContactView;
