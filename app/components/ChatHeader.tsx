"use client";

import { useState } from "react";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Conversation } from "../types/chat";
import Modal from "./Modal";
import MoreOptionsMenu from "./MoreOptionsMenu";

interface ChatHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  onClearChat: () => void;
  onDeleteConversation: () => void;
}

export default function ChatHeader({
  conversation,
  onBack,
  onClearChat,
  onDeleteConversation,
}: ChatHeaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleUnavailableFeature = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
            {conversation.initials}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {conversation.name}
            </h2>
            <p
              className={`text-xs ${
                conversation.online
                  ? "text-green-500"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {conversation.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUnavailableFeature}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleUnavailableFeature}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message="This feature is not available yet. Stay tuned for updates!"
      />

      <MoreOptionsMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onClearChat={onClearChat}
        onDeleteConversation={onDeleteConversation}
        context="chat"
      />
    </>
  );
}
