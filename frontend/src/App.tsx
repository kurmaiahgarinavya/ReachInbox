import {
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent
} from "react";

const API_URL = "http://localhost:5000";

type User = {
  id: number;
  google_id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

type Sender = {
  id: number;
  name: string;
  email: string;
};

type EmailItem = {
  id: number;
  scheduled_at?: string;
  sent_at?: string;
  status: string;
  subject: string;
  body: string;
  recipient_name?: string;
  recipient_email: string;
  sender_name?: string;
  sender_email?: string;
};

type Recipient = {
  name: string;
  email: string;
};

type Section = "scheduled" | "sent";

/* =========================
   LOGIN
========================= */

function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-8">
          Login
        </h1>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-12 rounded-lg bg-[#e8f7ee] text-gray-800 font-medium flex items-center justify-center gap-3 hover:bg-[#ddf2e5] transition"
        >
          <span className="text-lg font-bold">G</span>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-7">
          <div className="h-px bg-gray-200 flex-1" />

          <span className="text-xs text-gray-400 whitespace-nowrap">
            or sign up through email
          </span>

          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email ID
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full h-12 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full h-12 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>

        <button
          type="button"
          className="w-full h-12 rounded-lg bg-[#52b788] text-white font-medium hover:bg-[#40916c] transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

/* =========================
   SIDEBAR
========================= */

function Sidebar({
  user,
  section,
  setSection,
  scheduledCount,
  sentCount,
  onCompose,
  onLogout
}: {
  user: User;
  section: Section;
  setSection: (section: Section) => void;
  scheduledCount: number;
  sentCount: number;
  onCompose: () => void;
  onLogout: () => void;
}) {
  const firstLetter = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <aside className="w-[207px] min-h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-4 pt-4 pb-2">
        <div className="text-[25px] font-black tracking-[-2px] text-gray-900">
          ONB
        </div>
      </div>

      <div className="px-3">
        <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-[#f5f7f6]">
          <div className="flex items-center gap-2 min-w-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="w-8 h-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 shrink-0 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-semibold">
                {firstLetter}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">
                {user.name}
              </p>

              <p className="text-[9px] text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <span className="text-gray-400 text-[10px]">
            ⌄
          </span>
        </div>
      </div>

      <div className="px-3 mt-2">
        <button
          type="button"
          onClick={onCompose}
          className="w-full h-8 rounded-full border border-[#52b788] text-[#27945f] text-[11px] font-medium hover:bg-green-50 transition"
        >
          Compose
        </button>
      </div>

      <div className="px-3 mt-6">
        <p className="px-2 mb-1 text-[9px] font-medium text-gray-400 uppercase">
          Core
        </p>

        <button
          type="button"
          onClick={() => setSection("scheduled")}
          className={`w-full h-8 px-2 rounded-md flex items-center justify-between text-gray-600 ${
            section === "scheduled"
              ? "bg-[#e4f5eb]"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-[13px]">
              ◷
            </span>

            <span className="text-[11px]">
              Scheduled
            </span>
          </div>

          <span className="text-[10px] text-gray-400">
            {scheduledCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSection("sent")}
          className={`w-full h-8 px-2 rounded-md flex items-center justify-between text-gray-600 ${
            section === "sent"
              ? "bg-[#e4f5eb]"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-[13px]">
              ◇
            </span>

            <span className="text-[11px]">
              Sent
            </span>
          </div>

          <span className="text-[10px] text-gray-400">
            {sentCount}
          </span>
        </button>
      </div>

      <div className="mt-auto px-3 pb-5">
        <button
          type="button"
          onClick={onLogout}
          className="w-full text-left px-2 py-2 text-xs text-gray-500 hover:text-red-500"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

/* =========================
   COMPOSE PAGE
========================= */

function ComposePage({
  user,
  onClose,
  onCreated
}: {
  user: User;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [senderId, setSenderId] = useState("");

  const [recipients, setRecipients] = useState<Recipient[]>(
    []
  );

  const [recipientInput, setRecipientInput] =
    useState("");

  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [delaySeconds, setDelaySeconds] =
    useState("5");

  const [hourlyLimit, setHourlyLimit] =
    useState("100");

  /* NEW: number of emails detected from uploaded file */
  const [detectedEmailCount, setDetectedEmailCount] =
    useState(0);

  const [loadingSenders, setLoadingSenders] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/emails/senders`, {
      credentials: "include"
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load senders"
          );
        }

        return response.json();
      })
      .then((data: Sender[]) => {
        setSenders(data);

        if (data.length > 0) {
          setSenderId(String(data[0].id));
        }
      })
      .catch(() => {
        setMessage(
          "Unable to load sender accounts."
        );
      })
      .finally(() => {
        setLoadingSenders(false);
      });
  }, []);

  const addRecipient = () => {
    const email = recipientInput.trim();

    if (!email) {
      return;
    }

    const alreadyExists = recipients.some(
      (recipient) =>
        recipient.email.toLowerCase() ===
        email.toLowerCase()
    );

    if (alreadyExists) {
      setRecipientInput("");
      return;
    }

    setRecipients([
      ...recipients,
      {
        name: "",
        email
      }
    ]);

    setRecipientInput("");
  };

  const removeRecipient = (email: string) => {
    setRecipients(
      recipients.filter(
        (recipient) =>
          recipient.email !== email
      )
    );
  };

  const handleRecipientKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();
      addRecipient();
    }
  };

  /* =========================
     CSV / TXT UPLOAD
  ========================= */

  const handleCsvUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const content = String(
        reader.result || ""
      );

      /*
       * Detect actual email addresses
       * from the uploaded file.
       */
      const emailRegex =
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

      const detectedEmails =
        content.match(emailRegex) || [];

      /*
       * Remove duplicate addresses.
       */
      const uniqueEmails = [
        ...new Set(
          detectedEmails.map((email) =>
            email.toLowerCase()
          )
        )
      ];

      /*
       * Convert detected emails into
       * recipients used by the campaign.
       */
      const uploadedRecipients: Recipient[] =
        uniqueEmails.map((email) => ({
          name: "",
          email
        }));

      /*
       * Keep manually entered recipients
       * and merge uploaded recipients.
       */
      const mergedRecipients = [
        ...recipients
      ];

      for (const recipient of uploadedRecipients) {
        const alreadyExists =
          mergedRecipients.some(
            (existing) =>
              existing.email.toLowerCase() ===
              recipient.email.toLowerCase()
          );

        if (!alreadyExists) {
          mergedRecipients.push(
            recipient
          );
        }
      }

      setRecipients(
        mergedRecipients
      );

      /*
       * Show the actual count detected
       * from the uploaded file.
       */
      setDetectedEmailCount(
        uniqueEmails.length
      );

      if (uniqueEmails.length === 0) {
        setMessage(
          `No email addresses detected in ${file.name}.`
        );
      } else {
        setMessage(
          `${uniqueEmails.length} email addresses detected from ${file.name}.`
        );
      }
    };

    reader.onerror = () => {
      setMessage(
        "Failed to read the uploaded file."
      );
    };

    reader.readAsText(file);

    /*
     * Allows the user to upload the
     * same file again if needed.
     */
    event.target.value = "";
  };

  /* =========================
     SCHEDULE CAMPAIGN
  ========================= */

  const handleSchedule = async () => {
    setMessage("");

    if (!senderId) {
      setMessage(
        "Please select a sender."
      );
      return;
    }

    if (recipients.length === 0) {
      setMessage(
        "Please upload a CSV/TXT file or add at least one recipient."
      );
      return;
    }

    if (!subject.trim()) {
      setMessage(
        "Please enter a subject."
      );
      return;
    }

    if (!text.trim()) {
      setMessage(
        "Please write an email."
      );
      return;
    }

    if (!scheduledAt) {
      setMessage(
        "Please select a date and time."
      );
      return;
    }

    const selectedTime =
      new Date(scheduledAt).getTime();

    if (selectedTime <= Date.now()) {
      setMessage(
        "Please choose a future date and time."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/api/emails/campaign`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            subject: subject.trim(),
            text: text.trim(),
            scheduledAt:
              new Date(
                scheduledAt
              ).toISOString(),
            senderId: Number(senderId),
            recipients,

            delaySeconds:
              Number(delaySeconds),

            hourlyLimit:
              Number(hourlyLimit)
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to schedule campaign"
        );
      }

      setMessage(
        `Campaign scheduled for ${recipients.length} recipient${
          recipients.length === 1
            ? ""
            : "s"
        }.`
      );

      setTimeout(() => {
        onCreated();
      }, 800);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to schedule campaign."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-2xl text-gray-500 hover:text-gray-900"
            >
              ←
            </button>

            <h1 className="text-xl font-medium text-gray-900">
              Compose New Email
            </h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-8 py-8">
        <div className="bg-white">
          <div className="space-y-5">

            {/* FROM */}

            <div className="grid grid-cols-[90px_1fr] items-center">
              <label className="text-xs text-gray-600">
                From
              </label>

              {loadingSenders ? (
                <p className="text-sm text-gray-400">
                  Loading senders...
                </p>
              ) : senders.length === 0 ? (
                <p className="text-sm text-red-500">
                  No sender accounts found.
                </p>
              ) : (
                <select
                  value={senderId}
                  onChange={(event) =>
                    setSenderId(
                      event.target.value
                    )
                  }
                  className="w-fit min-w-[280px] h-10 bg-[#f5f6f5] rounded-lg px-3 text-sm outline-none"
                >
                  {senders.map((sender) => (
                    <option
                      key={sender.id}
                      value={sender.id}
                    >
                      {sender.name} —{" "}
                      {sender.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* TO */}

            <div className="grid grid-cols-[90px_1fr]">
              <label className="text-xs text-gray-600 pt-3">
                To
              </label>

              <div>
                <div className="min-h-[45px] border-b border-gray-200 flex flex-wrap items-center gap-2 py-2">

                  {recipients.map(
                    (recipient) => (
                      <div
                        key={recipient.email}
                        className="flex items-center gap-2 border border-[#52b788] bg-white text-[#27945f] px-2.5 py-1 rounded-full text-xs"
                      >
                        {recipient.email}

                        <button
                          type="button"
                          onClick={() =>
                            removeRecipient(
                              recipient.email
                            )
                          }
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}

                  <input
                    type="email"
                    value={recipientInput}
                    onChange={(event) =>
                      setRecipientInput(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleRecipientKeyDown
                    }
                    onBlur={
                      addRecipient
                    }
                    placeholder={
                      recipients.length === 0
                        ? "Add recipient manually"
                        : "Add recipient"
                    }
                    className="flex-1 min-w-[200px] h-8 text-sm outline-none"
                  />
                </div>

                {/* UPLOAD */}

                <div className="flex items-center justify-end gap-3 mt-2">

                  <label className="text-xs text-[#27945f] cursor-pointer hover:underline">
                    ↑ Upload List

                    <input
                      type="file"
                      accept=".csv,.txt,text/csv,text/plain"
                      onChange={
                        handleCsvUpload
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {/* DETECTED COUNT */}

                {detectedEmailCount > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    {detectedEmailCount} email
                    {detectedEmailCount === 1
                      ? ""
                      : "s"} detected
                  </p>
                )}
              </div>
            </div>

            {/* SUBJECT */}

            <div className="grid grid-cols-[90px_1fr] items-center">
              <label className="text-xs text-gray-600">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(
                    event.target.value
                  )
                }
                placeholder="Subject"
                className="w-full h-10 border-b border-gray-200 px-2 text-sm outline-none focus:border-green-500"
              />
            </div>

            {/* BODY */}

            <div className="grid grid-cols-[90px_1fr]">
              <div />

              <textarea
                value={text}
                onChange={(event) =>
                  setText(event.target.value)
                }
                placeholder="Type Your Reply..."
                rows={13}
                className="w-full bg-[#fafafa] rounded-lg p-4 text-sm outline-none resize-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* SETTINGS */}

            <div className="grid grid-cols-3 gap-8 pl-[90px] pt-2">

              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Delay between 2 emails
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={delaySeconds}
                    onChange={(event) =>
                      setDelaySeconds(
                        event.target.value
                      )
                    }
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none"
                  />

                  <span className="text-xs text-gray-400">
                    sec
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Hourly Limit
                </label>

                <input
                  type="number"
                  min="1"
                  value={hourlyLimit}
                  onChange={(event) =>
                    setHourlyLimit(
                      event.target.value
                    )
                  }
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Send Later
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) =>
                    setScheduledAt(
                      event.target.value
                    )
                  }
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none"
                />
              </div>
            </div>

            {/* MESSAGE */}

            {message && (
              <div className="ml-[90px] rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
                {message}
              </div>
            )}

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 h-10 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSchedule}
                disabled={saving}
                className="px-6 h-10 rounded-lg bg-[#52b788] text-white text-sm font-medium hover:bg-[#40916c] disabled:opacity-50"
              >
                {saving
                  ? "Scheduling..."
                  : "Send Later"}
              </button>
            </div>

            <p className="text-xs text-gray-400 pl-[90px]">
              Logged in as {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   EMAIL LIST
========================= */

function formatScheduledTime(
  value: string
) {
  const date = new Date(value);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatSentDate(value: string) {
  const date = new Date(value);

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });
}

function getBodyPreview(body: string) {
  const cleanBody = body
    .replace(/\s+/g, " ")
    .trim();

  if (cleanBody.length <= 70) {
    return cleanBody;
  }

  return `${cleanBody.slice(0, 70)}...`;
}

function EmailList({
  items,
  section,
  onSelect
}: {
  items: EmailItem[];
  section: Section;
  onSelect: (item: EmailItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <p className="text-sm text-gray-400">
          No emails to display.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-3">
      <div className="bg-white">
        {items.map((item) => {
          const recipient =
            item.recipient_name ||
            item.recipient_email;

          const preview =
            getBodyPreview(item.body);

          return (
            <button
              type="button"
              key={item.id}
              onClick={() =>
                onSelect(item)
              }
              className="w-full text-left border-b border-gray-100 hover:bg-gray-50 transition"
            >
              <div className="min-h-[58px] px-3 flex items-center gap-4">
                <div className="w-[165px] shrink-0">
                  <p className="text-xs text-gray-800 truncate">
                    To: {recipient}
                  </p>
                </div>

                <div className="shrink-0">
                  {section ===
                    "scheduled" &&
                  item.scheduled_at ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0dc] border border-[#ffd9ad] px-2 py-1 text-[10px] text-[#d98722] whitespace-nowrap">
                      <span>◷</span>

                      {formatScheduledTime(
                        item.scheduled_at
                      )}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {item.sent_at
                        ? formatSentDate(
                            item.sent_at
                          )
                        : ""}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-800 truncate">
                    {item.subject}
                  </span>

                  <span className="text-xs text-gray-400 truncate">
                    - {preview}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   EMAIL DETAILS
========================= */

function EmailDetails({
  item,
  onClose
}: {
  item: EmailItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-auto">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Email Details
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              Subject
            </p>

            <p className="text-base font-medium text-gray-900">
              {item.subject}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">
              From
            </p>

            <p className="text-sm text-gray-700">
              {item.sender_name ||
                "Sender"}{" "}
              {item.sender_email
                ? `<${item.sender_email}>`
                : ""}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">
              To
            </p>

            <p className="text-sm text-gray-700">
              {item.recipient_name
                ? `${item.recipient_name} <${item.recipient_email}>`
                : item.recipient_email}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">
              Status
            </p>

            <p className="text-sm text-gray-700 capitalize">
              {item.status}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">
              Message
            </p>

            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-6">
              {item.body}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {item.sent_at
                ? `Sent: ${new Date(
                    item.sent_at
                  ).toLocaleString()}`
                : item.scheduled_at
                ? `Scheduled: ${new Date(
                    item.scheduled_at
                  ).toLocaleString()}`
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  user,
  onLogout
}: {
  user: User;
  onLogout: () => void;
}) {
  const [section, setSection] =
    useState<Section>("scheduled");

  const [scheduled, setScheduled] =
    useState<EmailItem[]>([]);

  const [sent, setSent] =
    useState<EmailItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [composeOpen, setComposeOpen] =
    useState(false);

  const [selectedEmail, setSelectedEmail] =
    useState<EmailItem | null>(null);

  const loadEmails = async () => {
    setLoading(true);

    try {
      const [
        scheduledResponse,
        sentResponse
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/emails/scheduled`,
          {
            credentials: "include"
          }
        ),
        fetch(
          `${API_URL}/api/emails/sent`,
          {
            credentials: "include"
          }
        )
      ]);

      if (
        !scheduledResponse.ok ||
        !sentResponse.ok
      ) {
        throw new Error(
          "Failed to load emails"
        );
      }

      const scheduledData =
        await scheduledResponse.json();

      const sentData =
        await sentResponse.json();

      setScheduled(scheduledData);
      setSent(sentData);
    } catch (error) {
      console.error(
        "Failed to load dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const items =
    section === "scheduled"
      ? scheduled
      : sent;

  if (composeOpen) {
    return (
      <ComposePage
        user={user}
        onClose={() =>
          setComposeOpen(false)
        }
        onCreated={() => {
          setComposeOpen(false);
          loadEmails();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar
        user={user}
        section={section}
        setSection={setSection}
        scheduledCount={
          scheduled.length
        }
        sentCount={sent.length}
        onCompose={() =>
          setComposeOpen(true)
        }
        onLogout={onLogout}
      />

      <main className="flex-1 bg-white min-w-0">
        <div className="h-[62px] px-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {section === "scheduled"
                ? "Scheduled"
                : "Sent"}
            </h1>

            <p className="text-[11px] text-gray-400">
              {items.length} email
              {items.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setComposeOpen(true)
            }
            className="h-9 px-5 rounded-lg bg-[#52b788] text-white text-xs font-medium hover:bg-[#40916c]"
          >
            Compose
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-62px)]">
            <p className="text-sm text-gray-400">
              Loading...
            </p>
          </div>
        ) : (
          <EmailList
            items={items}
            section={section}
            onSelect={setSelectedEmail}
          />
        )}

        {selectedEmail && (
          <EmailDetails
            item={selectedEmail}
            onClose={() =>
              setSelectedEmail(null)
            }
          />
        )}
      </main>
    </div>
  );
}

/* =========================
   APP
========================= */

function App() {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, {
      credentials: "include"
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Not logged in"
          );
        }

        return response.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include"
        }
      );
    } finally {
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;