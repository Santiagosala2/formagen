
"use client";

import { useEffect, useState } from "react";
import { FormBuilder, MakeFieldNotRequired, MakeFieldRequired } from "./formBuilder";
import services from "@/services/form";
import { CheckboxQuestion, Question, QuestionDefaultValue, QuestionSchema } from "./types";
import { redirect } from "next/navigation";
import { Form } from "../formsTable/types";
import { Message } from "@/services/common";


export default function SetFormBuilder({ id, submit }: {
    id: string
    submit?: boolean

}) {

    const [formValues, setFormValues] = useState<any>()
    const [fetching, setFetching] = useState<boolean>(true)

    useEffect(() => {
        const getForm = async () => {
            const formDetails = await services.getForm(id);
            const formDetailsErrors = formDetails as Message
            if (formDetailsErrors.statusCode !== 404) {
                const defaultValuesObj: QuestionSchema = {}
                let validationSchemaObj: any
                let questions = (formDetails as Form).questions ?? []
                questions = questions.map((q: Question) => {
                    validationSchemaObj = {
                        ...validationSchemaObj,
                        ...(q.required ?
                            MakeFieldRequired(q.id, q.type, (q as CheckboxQuestion).multi ? "MultiCheckbox" : undefined)
                            : MakeFieldNotRequired(q.id, q.type, (q as CheckboxQuestion).multi ? "MultiCheckbox" : undefined))
                    }
                    let defaultValue: any = q.defaultValue;
                    if (!defaultValue) defaultValue = undefined;
                    defaultValuesObj[q.id] = defaultValue
                    return {
                        ...q,
                        selected: false,
                        defaultValue: defaultValue
                    }
                })
                setFormValues(
                    {
                        ...formDetails,
                        questions: questions,
                        validationSchema: validationSchemaObj ?? {},
                        initialValues: defaultValuesObj
                    });
            }
            setFetching(false)

        }
        getForm()
    }, [])

    if (!formValues && !fetching) {
        redirect('/dashboard')
    }
    return (
        <>
            {!fetching ? <FormBuilder {...formValues} submit={submit} /> : null}
        </>
    )
}