
"use client";

import { FormBuilder } from "@/components/formBuilder/formBuilder";
import { SetDefaultFormData } from "@/components/formBuilder/setFormBuilder";
import { FormBuilderMode } from "@/components/formBuilder/types";
import { useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';

export default function Play() {
    const [fetching, setFetching] = useState(true)
    const [defaultForm, setDefaultForm] = useState({
        id: uuid(),
        name: "",
        title: "",
        description: "",
        questions: [],
        enabledSteps: false,
        enabledValidateOnStep: false,
        enabledValidateOnJump: false,
        steps: [],
        initialValues: undefined,
        validationSchema: undefined
    })

    useEffect(() => {
        const localForm = localStorage.getItem("formagen")
        if (localForm) {
            const form = JSON.parse(localForm)
            if (form.enabledSteps === undefined) {
                form.enabledSteps = false;
                form.steps = []
                form.enabledValidateOnStep = false
                form.enabledValidateOnJump = false
            }

            setDefaultForm({
                ...form,
                ...SetDefaultFormData(form.questions)
            })

        }
        setFetching(false)

    }, [])


    return (
        <div className="flex justify-center min-h-screen gap-6 py-4 px-4">
            {!fetching && <FormBuilder {...defaultForm} mode={FormBuilderMode.Designer} saveHandler={(currentForm) => localStorage.setItem("formagen", JSON.stringify(currentForm))
            } />}
        </div>
    )
}

