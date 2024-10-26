import { TextInput, PasswordInput, Button } from "@mantine/core";
import {useForm} from "@mantine/form";
import supabase from "../utils/supabase";

function Signup() {
    function signUpWithGoogle() {
        supabase.auth.signInWithOAuth({
            provider: "google",
        })
    }


    return (
        <div className="flex justify-center items-center text-center min-h-[80vh]">
            <div className="flex flex-col gap-12 w-full max-w-[32rem]">
                <h1 className="text-4xl font-bold">Sign Up!</h1>
                <Button fullWidth onClick={signUpWithGoogle} radius={100} size="lg">Sign up with Google!</Button>
            </div>
        </div>
    );
}

export default Signup;