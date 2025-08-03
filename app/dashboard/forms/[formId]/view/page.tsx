import { SetResponseTable } from "@/components/formsResponseTable/formsResponseTable";



export default async function ViewResponse({
    params
}: {
    params: Promise<{ formId: string }>
}) {
    const { formId } = await params
    return (
        <div className="w-full h-full">
            <SetResponseTable formId={formId} />
        </div>
    );
}
