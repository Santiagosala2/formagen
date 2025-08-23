
"use client";

import { useContext, useEffect, useState } from "react";
import { FormBuilder, MakeFieldNotRequired, MakeFieldRequired } from "./formBuilder";
import { services } from "@/services";
import { CheckboxQuestion, Question, QuestionSchema } from "./types";
import { redirect } from "next/navigation";
import { Form } from "../formsTable/types";
import { Message } from "@/services/common";
import { AuthContext } from "../auth/authProvider";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";


export default function SetFormBuilder({ id, submit }: {
    id: string
    submit?: boolean

}) {

    const [formValues, setFormValues] = useState<any>()
    const [fetching, setFetching] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [notAccess, setNotAccess] = useState<boolean>(false);
    const authContext = useContext(AuthContext);


    useEffect(() => {
        const getForm = async () => {
            const formDetails = await services.form.getForm(id);
            const formDetailsErrors = formDetails as Message
            if (formDetailsErrors.statusCode === 404) return setNotFound(true);
            if (formDetailsErrors.statusCode === 401) return setNotAccess(true);
            const questions = (formDetails as Form).questions ?? []
            setFormValues(
                {
                    ...formDetails,
                    ...SetDefaultFormData(questions)
                });
            setFetching(false)

        }
        getForm()
    }, [])

    if (notFound && !fetching) {
        redirect('/dashboard')
    }
    return (
        <>
            {!fetching && !notFound && !notAccess ? <FormBuilder {...formValues} submit={submit} user={authContext} /> : null}
            {authContext?.isAdmin &&
                <AlertDialog open={notFound}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Form not found!</AlertDialogTitle>
                            <AlertDialogDescription>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => redirect("/dashboard/forms")} >Go to the dashboard</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            }
            {!authContext?.isAdmin &&
                <AlertDialog open={notAccess}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Access denied!</AlertDialogTitle>
                            <AlertDialogDescription>
                                You do not have permission to access this form
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => redirect("/dashboard/forms")} >Go home </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            }
        </>
    )
}

export function SetDefaultFormData(questions: Question[],) {
    const defaultValuesObj: QuestionSchema = {}
    let validationSchemaObj: any
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

    return {
        questions: questions,
        validationSchema: validationSchemaObj ?? {},
        initialValues: defaultValuesObj
    }

}