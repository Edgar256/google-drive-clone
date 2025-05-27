import { Suspense } from "react";
import DriveContent from "./DriveContent";

export default function DrivePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DriveContent />
    </Suspense>
  );
} 