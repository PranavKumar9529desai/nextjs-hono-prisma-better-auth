import SignOutButton from "@/components/logout";
import PostsTest from "@/components/post-test";
import PrivateRoute from "@/components/privateRoute";
import RBACOverview from "@/components/rbac/rbac-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Private dashboard</h1>
        <p className="text-sm text-neutral-500">
          Signed-in area protected by Better Auth + Hono middleware.
        </p>
      </section>

      <div className="space-y-4">
        <SignOutButton />
        <PrivateRoute />
        <PostsTest />
      </div>

      <RBACOverview />
    </div>
  );
}
