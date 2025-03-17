import React from "react";
import { UserJourney } from "@/components/ui/user-journey";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">내 시청 여정</h1>
      <UserJourney />
    </div>
  );
}
