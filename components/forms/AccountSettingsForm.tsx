"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  currentEmail: string;
  role: "talent" | "studio";
};

export function AccountSettingsForm({ currentEmail, role }: Props) {
  const router = useRouter();

  // Email
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [emailMsg, setEmailMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg(null);
    if (!newEmail || newEmail === currentEmail) {
      setEmailMsg({ kind: "err", text: "Enter a different email address." });
      return;
    }
    setEmailLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailLoading(false);
    if (error) {
      setEmailMsg({ kind: "err", text: error.message });
      return;
    }
    setEmailMsg({
      kind: "ok",
      text: "Check both inboxes — we sent a confirmation link to your old and new address.",
    });
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg({ kind: "err", text: "Password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ kind: "err", text: "Passwords do not match." });
      return;
    }
    setPwLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) {
      setPwMsg({ kind: "err", text: error.message });
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPwMsg({ kind: "ok", text: "Password updated." });
  }

  async function onDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleteMsg(null);
    if (deleteConfirm.trim().toUpperCase() !== "DELETE") {
      setDeleteMsg("Type DELETE to confirm.");
      return;
    }
    setDeleteLoading(true);

    const res = await fetch("/api/account/delete", { method: "POST" });
    if (!res.ok) {
      setDeleteLoading(false);
      const body = await res.json().catch(() => ({}));
      setDeleteMsg(body?.error ?? "Could not delete account.");
      return;
    }

    // Server has flipped deleted_at, unpublished the profile, and signed us out.
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-0.5">
      {/* Email */}
      <div className="bg-dark-3 border-t-2 border-orange p-8">
        <h2 className="font-display text-[20px] tracking-[1px] text-warm-white mb-4 leading-none">
          EMAIL
        </h2>
        <form onSubmit={onEmailSubmit} noValidate>
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
          />
          {emailMsg && (
            <p
              className={`font-condensed text-[11px] mt-2 ${
                emailMsg.kind === "ok" ? "text-success" : "text-orange"
              }`}
            >
              {emailMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={emailLoading}
            className="mt-4 font-condensed text-[12px] font-bold uppercase tracking-[2px] text-warm-white bg-orange hover:bg-orange-hot disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 transition-colors"
          >
            {emailLoading ? "Saving…" : "Update Email"}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-dark-3 p-8">
        <h2 className="font-display text-[20px] tracking-[1px] text-warm-white mb-4 leading-none">
          PASSWORD
        </h2>
        <form onSubmit={onPasswordSubmit} noValidate>
          <div className="mb-4">
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              New Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            />
          </div>
          {pwMsg && (
            <p
              className={`font-condensed text-[11px] mt-3 ${
                pwMsg.kind === "ok" ? "text-success" : "text-orange"
              }`}
            >
              {pwMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={pwLoading}
            className="mt-4 font-condensed text-[12px] font-bold uppercase tracking-[2px] text-warm-white bg-orange hover:bg-orange-hot disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 transition-colors"
          >
            {pwLoading ? "Saving…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Delete */}
      <div className="bg-dark-3 border-b-2 border-orange/40 p-8">
        <h2 className="font-display text-[20px] tracking-[1px] text-orange mb-2 leading-none">
          DELETE ACCOUNT
        </h2>
        <p className="font-body text-[13px] text-grey mb-4">
          {role === "talent"
            ? "Your profile will be unpublished immediately and your account marked for deletion. All data is permanently removed after 30 days."
            : "Your studio account will be marked for deletion immediately. Saved talent and studio data are permanently removed after 30 days."}
        </p>
        <form onSubmit={onDelete} noValidate>
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Type <span className="text-orange">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
          />
          {deleteMsg && (
            <p className="font-condensed text-[11px] text-orange mt-2">
              {deleteMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={deleteLoading || deleteConfirm.trim().toUpperCase() !== "DELETE"}
            className="mt-4 font-condensed text-[12px] font-bold uppercase tracking-[2px] text-warm-white bg-orange/80 hover:bg-orange disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 transition-colors"
          >
            {deleteLoading ? "Deleting…" : "Delete Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
