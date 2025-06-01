
"use client";

import { useEffect, useState } from "react";
import { FormBuilder, MakeFieldNotRequired, MakeFieldRequired } from "./formBuilder";
import services from "@/services/form";
import { Question, QuestionDefaultValue, QuestionSchema } from "./types";
import { redirect } from "next/navigation";


export default function SetFormBuilder({ id }: {
    id: string
}) {

    const [formValues, setFormValues] = useState<any>()
    const [fetching, setFetching] = useState<boolean>(true)

    useEffect(() => {
        const getForm = async () => {
            try {
                const formDetails = await services.getForm(id);
                if (formDetails.status !== 404) {
                    const defaultValuesObj: QuestionSchema = {}
                    let validationSchemaObj: any
                    const questions = formDetails.questions ?? []
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
            } catch (error) {
                console.log(error, 'there is an error - when setting the form values')
            }
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