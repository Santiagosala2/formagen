
"use client";

import { FormBuilder } from "@/components/formBuilder/formBuilder";
import { useEffect, useState } from "react";

export default function Playground() {
    const [defaultForm, setDefaultForm] = useState({
        id: "d",
        name: "",
        title: "",
        description: "",
        questions: [],
        initialValues: undefined,
        validationSchema: undefined,
        submitted: false
    })

    useEffect(() => {

    }, [])

    return (
        <div className="flex justify-center min-h-screen gap-6 py-4 px-4">
            <FormBuilder {...defaultForm} local />
        </div>
    )
}

