import { SetResponseTable } from "@/components/formsResponseTable/formsResponseTable";



export default async function ViewResponse({
    params
}: {
    params: Promise<{ formid: string }>
}) {
    const { formid } = await params
    return (
        <div className="w-full h-full">
            <SetResponseTable formId={formid} />
        </div>
    );
}
