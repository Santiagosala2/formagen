
"use client";

import { useEffect, useState } from "react";
import { FormBuilder, MakeFieldNotRequired, MakeFieldRequired } from "./formBuilder";
import services from "@/services/form";
import { Question, QuestionDefaultValue, QuestionSchema } from "./types";
import { redirect } from "next/navigation";
import { ErrorMessage, Form } from "../formsTable/types";


export default function SetFormBuilder({ id }: {
    id: string
}) {

    const [formValues, setFormValues] = useState<any>()
    const [fetching, setFetching] = useState<boolean>(true)

    useEffect(() => {
        const getForm = async () => {
            const formDetails = await services.getForm(id);
            const formDetailsErrors = formDetails as ErrorMessage
            if (formDetailsErrors.statusCode !== 404) {
                const defaultValuesObj: QuestionSchema = {}
                let validationSchemaObj: any
                const questions = (formDetails as Form).questions ?? []
                questions.forEach((el: Question) => {
                    validationSchemaObj = {
                        ...validationSchemaObj,
                        ...(el.required ?
                            MakeFieldRequired(el.id, el.type)
                            : MakeFieldNotRequired(el.id, el.type))
                    }
                    defaultValuesObj[el.id] = el.defaultValue
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
            {!fetching ? <FormBuilder {...formValues} /> : null}
        </>
    )
}