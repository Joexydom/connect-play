import avatarMaya from "@/assets/avatar-maya.jpg";
import avatarLeo from "@/assets/avatar-leo.jpg";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarMarcus from "@/assets/avatar-marcus.jpg";
import streamCyberpunk from "@/assets/stream-cyberpunk.jpg";
import thumbLofi from "@/assets/thumb-lofi.jpg";
import thumbCook from "@/assets/thumb-cook.jpg";
import thumbGame from "@/assets/thumb-game.jpg";
import callRemote from "@/assets/call-remote.jpg";

export { callRemote };

export type MessageTone = "primary" | "accent" | "muted" | "self" | "system";

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  tone: MessageTone;
  time: string;
}

export interface Friend {
  name: string;
  handle: string;
  avatar: string;
  online: boolean;
}

export const friends: Friend[] = [
  { name: "Maya Chen", handle: "maya.c", avatar: avatarMaya, online: true },
  { name: "Leo Wang", handle: "leo_w", avatar: avatarLeo, online: true },
  { name: "Sarah Okafor", handle: "sarah.dev", avatar: avatarSarah, online: true },
  { name: "Marcus Bell", handle: "mike_r", avatar: avatarMarcus, online: false },
];

export interface VideoItem {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  viewers: string;
  duration: string;
  thumb: string;
  posted: string;
}

export const videos: VideoItem[] = [
  {
    id: "cyberpunk",
    title: "Cyberpunk 2077 Night Mix",
    creator: "NeonTheory",
    creatorAvatar: avatarLeo,
    viewers: "4,209",
    duration: "1:24:07",
    thumb: streamCyberpunk,
    posted: "2 hours ago",
  },
  {
    id: "lofi",
    title: "Lo-fi beats to build apps to",
    creator: "june_bug",
    creatorAvatar: avatarMaya,
    viewers: "1,872",
    duration: "2:03:44",
    thumb: thumbLofi,
    posted: "45 min ago",
  },
  {
    id: "streetfood",
    title: "Bangkok street food at 2AM",
    creator: "wok_and_roll",
    creatorAvatar: avatarMarcus,
    viewers: "968",
    duration: "18:22",
    thumb: thumbCook,
    posted: "5 hours ago",
  },
  {
    id: "racing",
    title: "Neon Grand Prix — finals",
    creator: "apex.tv",
    creatorAvatar: avatarSarah,
    viewers: "12.4k",
    duration: "42:10",
    thumb: thumbGame,
    posted: "1 day ago",
  },
];

export const liveChatMessages: ChatMessage[] = [
  {
    id: "lc-1",
    author: "alex_walker",
    text: "That transition was absolutely insane!",
    tone: "primary",
    time: "11:58 PM",
  },
  {
    id: "lc-2",
    author: "sarah.dev",
    text: "Anyone down for a quick video call to discuss the project?",
    tone: "accent",
    time: "11:59 PM",
  },
  {
    id: "lc-3",
    author: "moderator_bot",
    text: "sarah.dev started a huddle.",
    tone: "system",
    time: "11:59 PM",
  },
  {
    id: "lc-4",
    author: "mike_r",
    text: "Joining in 5 mins!",
    tone: "primary",
    time: "12:00 AM",
  },
];

export const liveChatReplies: string[] = [
  "This mix is unreal, been on repeat all week",
  "Who else is watching from Lagos tonight?",
  "The rain scenes always get me",
  "Can we do a watch party for the finale?",
  "That bass drop at 12:40 though",
  "Vibe really is the best place for these nights",
];

export const liveChatReplier = { author: "maya.c", tone: "accent" as MessageTone };

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
  replies: string[];
}

export const conversations: Conversation[] = [
  {
    id: "weekend",
    name: "Weekend Group",
    avatar: avatarMarcus,
    online: true,
    lastMessage: "Marcus: Yo, who's down to watch that new mix tonight?",
    time: "12:45 AM",
    unread: 3,
    messages: [
      {
        id: "w-1",
        author: "Marcus",
        text: "Yo, who's down to watch that new mix tonight?",
        tone: "primary",
        time: "12:38 AM",
      },
      {
        id: "w-2",
        author: "Maya",
        text: "I'm in! Bringing snacks to the call 🍿",
        tone: "accent",
        time: "12:41 AM",
      },
      {
        id: "w-3",
        author: "you",
        text: "Same, start a room at 9?",
        tone: "self",
        time: "12:43 AM",
      },
      {
        id: "w-4",
        author: "Marcus",
        text: "9 it is. Don't be late this time Leo",
        tone: "primary",
        time: "12:45 AM",
      },
    ],
    replies: [
      "Say less, setting up the room now",
      "Maya just shared a link in Watch 👀",
      "We should call first and pick together",
      "Bet, see everyone at 9 sharp",
    ],
  },
  {
    id: "maya",
    name: "Maya Chen",
    avatar: avatarMaya,
    online: true,
    lastMessage: "See you then! ✨",
    time: "Tue",
    unread: 1,
    messages: [
      {
        id: "m-1",
        author: "Maya",
        text: "Did you see the Neon Grand Prix finals? That last lap!",
        tone: "accent",
        time: "9:12 PM",
      },
      {
        id: "m-2",
        author: "you",
        text: "Watched it live with the group, chat went wild",
        tone: "self",
        time: "9:15 PM",
      },
      {
        id: "m-3",
        author: "Maya",
        text: "See you then! ✨",
        tone: "accent",
        time: "9:16 PM",
      },
    ],
    replies: [
      "Okay that's actually a great idea",
      "Want to hop on a quick call?",
      "Haha exactly what I was thinking",
      "Sending you the video now, one sec",
    ],
  },
  {
    id: "leo",
    name: "Leo Wang",
    avatar: avatarLeo,
    online: true,
    lastMessage: "The quality on the call was wild last night.",
    time: "1h ago",
    unread: 0,
    messages: [
      {
        id: "l-1",
        author: "Leo",
        text: "The quality on the call was wild last night.",
        tone: "primary",
        time: "11:02 PM",
      },
      {
        id: "l-2",
        author: "you",
        text: "Right? Felt like we were in the same room",
        tone: "self",
        time: "11:05 PM",
      },
    ],
    replies: [
      "We should do a movie night this weekend",
      "Did Sarah send you the project files?",
      "Lol fair enough",
      "Call you in 10?",
    ],
  },
  {
    id: "studio",
    name: "Studio Sunday",
    avatar: avatarSarah,
    online: false,
    lastMessage: "Sarah: Uploading the new cut tonight",
    time: "Sun",
    unread: 0,
    messages: [
      {
        id: "s-1",
        author: "Sarah",
        text: "Uploading the new cut tonight",
        tone: "accent",
        time: "6:40 PM",
      },
      {
        id: "s-2",
        author: "you",
        text: "Can't wait — watch party when it's live?",
        tone: "self",
        time: "6:44 PM",
      },
    ],
    replies: [
      "It's rendering now, almost done",
      "Yes!! Watch party at mine",
      "You two are going to love this edit",
    ],
  },
];
