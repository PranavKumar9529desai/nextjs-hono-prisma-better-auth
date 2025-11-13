"use client";

import { useState } from "react";
import client from "@/lib/trpc";
import type { InferRequestType } from "hono/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PostsTest() {
  const [posts, setPosts] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Test GET /api/posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const $get = client.api.posts.$get;
      const res = await $get({
        query: {
          limit: "5",
          offset: "0",
        },
      });
      const data = await res.json();
      setPosts(data);
      console.log("Fetched posts:", data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Test GET /api/posts/:id
  const fetchPost = async (id: string) => {
    setLoading(true);
    try {
      const $get = client.api.posts[":id"].$get;
      const res = await $get({
        param: { id },
      });
      const data = await res.json();
      console.log("Fetched post:", data);
      alert(`Post: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  // Test POST /api/posts
  const createPost = async () => {
    if (!title || !content) {
      alert("Please fill in title and content");
      return;
    }

    setLoading(true);
    try {
      const $post = client.api.posts.$post;
      const res = await $post({
        json: {
          title,
          content,
          author: "Test User",
        },
      });
      const data = await res.json();
      console.log("Created post:", data);
      alert(`Post created: ${JSON.stringify(data, null, 2)}`);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Hono RPC Test - Posts API</h2>

      {/* GET Posts */}
      <div className="border p-4 rounded-lg space-y-2">
        <h3 className="font-semibold">GET /api/posts</h3>
        <Button onClick={fetchPosts} disabled={loading}>
          {loading ? "Loading..." : "Fetch All Posts"}
        </Button>
        {posts && (
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(posts, null, 2)}
          </pre>
        )}
      </div>

      {/* GET Single Post */}
      <div className="border p-4 rounded-lg space-y-2">
        <h3 className="font-semibold">GET /api/posts/:id</h3>
        <div className="flex gap-2">
          <Button onClick={() => fetchPost("1")} disabled={loading}>
            Fetch Post 1
          </Button>
          <Button onClick={() => fetchPost("2")} disabled={loading}>
            Fetch Post 2
          </Button>
        </div>
      </div>

      {/* POST Create Post */}
      <div className="border p-4 rounded-lg space-y-4">
        <h3 className="font-semibold">POST /api/posts</h3>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Input
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post content"
          />
        </div>
        <Button onClick={createPost} disabled={loading}>
          {loading ? "Creating..." : "Create Post"}
        </Button>
      </div>
    </div>
  );
}
