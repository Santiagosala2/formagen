import SetFormBuilder from "@/components/formBuilder/setFormBuilder";
import { FormBuilderMode } from "@/components/formBuilder/types";



export default async function Submit({
  params
}: {
  params: Promise<{ formid: string }>
}) {

  const { formid } = await params

  return (
    <div className="flex justify-center min-h-screen gap-6 py-4 px-4">
      <SetFormBuilder id={formid} mode={FormBuilderMode.Submission} />
    </div>
  );
}
