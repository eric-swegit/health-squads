
import { useState } from "react";
import { FeedItem } from "@/components/feed/types";

export const useCommentDrawer = () => {
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);

  const openCommentDrawer = (item: FeedItem) => {
    setSelectedItem(item);
    setCommentDrawerOpen(true);
  };

  return {
    commentDrawerOpen,
    setCommentDrawerOpen,
    selectedItem,
    setSelectedItem,
    openCommentDrawer
  };
};
