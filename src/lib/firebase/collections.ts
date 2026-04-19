export const COLLECTIONS = {
  users: "users",
  posts: "posts",
  comments: "comments",
  likes: "likes",
  follows: "follows",
  plants: "plants",
  competitions: "competitions",
  products: "products",
  orders: "orders",
  carts: "carts",
  notifications: "notifications",
  logs: "logs",
  reports: "reports",
  moderationLogs: "moderationLogs",
  verificationRequests: "verificationRequests",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
