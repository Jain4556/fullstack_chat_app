import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    unreadCounts,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Fetch users and subscribe to messages on mount
  useEffect(() => {
    getUsers();
    subscribeToMessages();
    return () => unsubscribeFromMessages(); // Cleanup on unmount
  }, [getUsers, subscribeToMessages, unsubscribeFromMessages]);

  // Filter users based on online status
  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  // Sort users: prioritize those with unread messages, then alphabetically
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const unreadA = unreadCounts[a._id] || 0;
    const unreadB = unreadCounts[b._id] || 0;
    if (unreadA > unreadB) return -1; // A has more unread messages
    if (unreadB > unreadA) return 1;  // B has more unread messages
    return a.fullName.localeCompare(b.fullName); // Alphabetical tiebreaker
  });

  useEffect(() => {
    console.log("Sorted users:", sortedUsers.map(u => ({ name: u.fullName, unread: unreadCounts[u._id] || 0 })));
  }, [sortedUsers, unreadCounts]); // Debug sorting

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {sortedUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)} // Resets unread count
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - visible on larger screens */}
            <div className="hidden lg:flex items-center justify-between w-full text-left min-w-0">
              <div>
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
              {/* Unread message count */}
              {unreadCounts[user._id] > 0 && (
                <span className="badge badge-primary badge-sm">
                  {unreadCounts[user._id]}
                </span>
              )}
            </div>
          </button>
        ))}

        {sortedUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;