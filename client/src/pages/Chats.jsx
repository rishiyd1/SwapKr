import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import NavbarHome from "@/components/home/NavbarHome";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatsService } from "@/services/chats.service";
import { ordersService } from "@/services/orders.service";
import { requestsService } from "@/services/requests.service";
import { useSocket } from "@/components/chat/SocketContext";
import { authService } from "@/services/auth.service";

const Chats = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const newChatWithId = searchParams.get("newChatWith");
  const initialChatId = searchParams.get("chatId");

  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { socket } = useSocket();

  const currentUser = authService.getCurrentUser();

  // Fetch all chats
  const { data: rawChats, refetch: refetchChats } = useQuery({
    queryKey: ["chats"],
    queryFn: chatsService.getMyConversations,
    enabled: !!currentUser,
  });

  // Map chats to include otherUser info (Memoized to prevent infinite loops)
  const chats = useMemo(
    () =>
      (rawChats || []).map((chat) => {
        const isBuyer = chat.buyerId === currentUser?.id;
        const otherUser = isBuyer ? chat.seller : chat.buyer;
        return {
          ...chat,
          otherUser,
          isBuyer,
        };
      }),
    [rawChats, currentUser?.id],
  );

  // Fetch all incoming buy requests
  const { data: rawIncomingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ["incomingRequests"],
    queryFn: ordersService.getIncomingRequests,
    enabled: !!currentUser,
  });

  const incomingRequests = useMemo(
    () => rawIncomingRequests || [],
    [rawIncomingRequests],
  );

  // Fetch specific request details if requestId is present (for "I can provide this" flow)
  const { data: targetRequest } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => requestsService.getRequestById(requestId),
    enabled: !!requestId,
  });

  // Handle global socket events for list updates
  useEffect(() => {
    if (socket) {
      const handleNewMessage = () => {
        refetchChats();
      };
      socket.on("receive_message", handleNewMessage);
      socket.on("message_sent", handleNewMessage); // If we add this to backend
      return () => {
        socket.off("receive_message", handleNewMessage);
        socket.off("message_sent", handleNewMessage);
      };
    }
  }, [socket, refetchChats]);

  // Handle initial selection based on URL params
  useEffect(() => {
    if (!currentUser || !chats) return;

    // Check if we already have the correct selection to avoid loops
    const currentChatIdParam = searchParams.get("chatId");
    const currentRequestIdParam = searchParams.get("requestId");

    // Case 1: URL says we want a specific chat
    if (initialChatId) {
      const chat = chats.find((c) => c.id === initialChatId);
      if (chat) {
        if (selectedChat?.id !== chat.id) {
          setSelectedChat(chat);
          setSelectedRequest(null);
        }
        return;
      }
    }

    // Case 2: URL says we are starting a new chat (draft)
    if (newChatWithId) {
      const draftId = newChatWithId;
      if (selectedChat?.otherUser?.id !== draftId || !selectedChat.isDraft) {
        if (requestId && targetRequest) {
          setSelectedChat({
            isDraft: true,
            otherUser: targetRequest.requester || {
              id: draftId,
              name: "Requester",
            },
            item: {
              title: targetRequest.title,
              price: targetRequest.budget ? `₹${targetRequest.budget}` : null,
            },
            requestId: requestId,
          });
        } else {
          setSelectedChat({
            isDraft: true,
            otherUser: { id: draftId, name: "Loading..." },
            item: { title: "Providing requested item" },
            requestId: requestId || null,
          });
        }
        setSelectedRequest(null);
      } else if (
        selectedChat.isDraft &&
        requestId &&
        targetRequest &&
        selectedChat.item.title === "Providing requested item"
      ) {
        // If we are already in the draft chat but targetRequest just loaded, update it
        setSelectedChat({
          ...selectedChat,
          otherUser: targetRequest.requester || {
            id: draftId,
            name: "Requester",
          },
          item: {
            title: targetRequest.title,
            price: targetRequest.budget ? `₹${targetRequest.budget}` : null,
          },
        });
      }
      return;
    }

    // Case 3: URL says we want a specific request
    // Case 3: URL says we want a specific request
    if (requestId) {
      // IF we already have a selectedChat for SAME item/request and user, DON'T override
      if (
        selectedChat &&
        !selectedChat.isDraft &&
        selectedChat.requestId === requestId
      ) {
        return;
      }

      const request = incomingRequests.find((r) => r.id === requestId);

      if (request) {
        // Logic for Incoming Requests (I am the Seller/Provider receiving a request)
        if (request.status === "Accepted") {
          const matchingChat = chats.find(
            (c) =>
              c.buyerId === request.buyerId &&
              c.sellerId === request.sellerId &&
              c.itemId === request.itemId,
          );
          if (matchingChat) {
            if (selectedChat?.id !== matchingChat.id) {
              setSelectedChat(matchingChat);
              setSelectedRequest(null);
              // Update URL if it's currently showing request instead of chat
              if (currentChatIdParam !== matchingChat.id.toString()) {
                setSearchParams({ chatId: matchingChat.id });
              }
            }
          } else {
            // Chat matching accepted request not found yet
            if (selectedRequest?.id !== request.id) {
              setSelectedRequest(request);
              setSelectedChat(null);
            }
          }
        } else if (selectedRequest?.id !== request.id) {
          // Pending request
          setSelectedRequest(request);
          setSelectedChat(null);
        }
      } else if (targetRequest) {
        // Logic for Public Requests (I am the Provider responding to a public request)
        // Request not in incoming list (so it's a public request I'm responding to)
        setSelectedChat({
          isDraft: true,
          otherUser: targetRequest.requester || { name: "Requester" },
          item: {
            title: targetRequest.title,
            price: targetRequest.budget ? `₹${targetRequest.budget}` : null,
          },
          requestId: requestId,
        });
        setSelectedRequest(null);
      }
    }

    // Case 4: No params (Back to idle/empty state)
    if (!initialChatId && !newChatWithId && !requestId) {
      setSelectedChat(null);
      setSelectedRequest(null);
    }
  }, [
    requestId,
    initialChatId,
    newChatWithId,
    chats,
    incomingRequests,
    currentUser,
    setSearchParams,
    searchParams,
    selectedChat,
    selectedRequest,
    targetRequest,
  ]);

  const handleSelectChat = (chat) => {
    setSelectedRequest(null);
    setSelectedChat(chat);
    setSearchParams({ chatId: chat.id });
  };

  const handleSelectRequest = (request) => {
    setSelectedChat(null);
    setSelectedRequest(request);
    setSearchParams({ requestId: request.id });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  return (
    <div className="h-screen bg-background flex flex-col font-body overflow-hidden">
      <NavbarHome />
      <main className="flex-1 container px-4 py-4 md:px-6 mx-auto max-w-7xl overflow-hidden flex gap-4 relative">
        {/* Sidebar */}
        <div
          className={`
            md:w-80 w-full flex-shrink-0 bg-card/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm flex-col
            ${selectedChat || selectedRequest ? "hidden md:flex" : "flex"}
          `}
        >
          <ChatSidebar
            chats={chats}
            requests={incomingRequests}
            selectedChatId={selectedChat?.id}
            selectedRequestId={selectedRequest?.id}
            onSelectChat={handleSelectChat}
            onSelectRequest={handleSelectRequest}
          />
        </div>

        {/* Chat Window */}
        <div
          className={`
            flex-1 bg-card/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm flex-col relative
            ${selectedChat || selectedRequest ? "flex" : "hidden md:flex"}
          `}
        >
          <ChatWindow
            chat={selectedChat}
            request={selectedRequest}
            onBack={handleBack}
            onMessagesRead={() => {
              refetchChats();
              queryClient.invalidateQueries({
                queryKey: ["unreadChatSummary"],
              });
            }}
            onChatStarted={(newChat) => {
              refetchChats();
              refetchRequests();
              queryClient.invalidateQueries({
                queryKey: ["unreadChatSummary"],
              });
              if (newChat) {
                // Manually select the new chat after state update
                handleSelectChat(newChat);
              } else {
                setSelectedRequest(null);
                setSelectedChat(null);
              }
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default Chats;
