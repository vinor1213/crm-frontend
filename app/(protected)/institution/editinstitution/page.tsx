
import { Suspense } from "react";
import EditInstitutionPage from "@/components/Forms/EditInstitutionPage ";

export default function EditInstitutionPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditInstitutionPage />
    </Suspense>
  );
}
