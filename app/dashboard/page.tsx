import SignOutButton from "@/components/logout";
import PostsTest from "@/components/post-test";
import PrivateRoute from "@/components/privateRoute";

export default function DashboardPage() {
  return (
    <div>
      <h1>Private dashboard</h1>
      <SignOutButton />
      <PrivateRoute />
      <PostsTest />
    </div>
  );
}
