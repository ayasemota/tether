"use client";

import { useState } from "react";
import {
  X,
  LogOut,
  Trash2,
  MessageSquare,
  Bell,
  User,
  Settings,
  Lock,
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import Modal from "./Modal";

interface MoreOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onClearChat?: () => void;
  onDeleteConversation?: () => void;
  context: "sidebar" | "chat";
}

export default function MoreOptionsMenu({
  isOpen,
  onClose,
  onLogout,
  onClearChat,
  onDeleteConversation,
  context,
}: MoreOptionsMenuProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onClose();
    onLogout?.();
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    setShowClearConfirm(false);
    onClose();
    onClearChat?.();
  };

  const handleDeleteConversation = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteConversation = () => {
    setShowDeleteConfirm(false);
    onClose();
    onDeleteConversation?.();
  };

  const handleUnavailable = () => {
    setShowUnavailableModal(true);
  };

  const sidebarOptions = [
    {
      icon: User,
      label: "Profile",
      onClick: handleUnavailable,
      available: false,
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: handleUnavailable,
      available: false,
    },
    {
      icon: Bell,
      label: "Notifications",
      onClick: handleUnavailable,
      available: false,
    },
    {
      icon: Lock,
      label: "Privacy",
      onClick: handleUnavailable,
      available: false,
    },
    {
      icon: LogOut,
      label: "Logout",
      onClick: handleLogout,
      available: true,
      danger: true,
    },
  ];

  const chatOptions = [
    {
      icon: MessageSquare,
      label: "Clear Chat",
      onClick: handleClearChat,
      available: true,
    },
    {
      icon: Bell,
      label: "Mute Notifications",
      onClick: handleUnavailable,
      available: false,
    },
    {
      icon: User,
      label: "View Profile",
      onClick: handleUnavailable,
      available: false,
    },
    {
      icon: Lock,
      label: "Block Contact",
      onClick: handleUnavailable,
      available: false,
    },
    {
      icon: Trash2,
      label: "Delete Conversation",
      onClick: handleDeleteConversation,
      available: true,
      danger: true,
    },
  ];

  const options = context === "sidebar" ? sidebarOptions : chatOptions;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {context === "sidebar" ? "More Options" : "Chat Options"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-2">
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={index}
                  onClick={option.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    option.danger
                      ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      : option.available
                      ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{option.label}</span>
                  {!option.available && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        confirmDanger
      />

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearChat}
        title="Clear Chat"
        message="Are you sure you want to clear all messages in this chat? This action cannot be undone."
        confirmText="Clear Chat"
        confirmDanger
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        confirmDanger
      />

      <Modal
        isOpen={showUnavailableModal}
        onClose={() => setShowUnavailableModal(false)}
        message="This feature is not available yet. Stay tuned for updates!"
      />
    </>
  );
}
