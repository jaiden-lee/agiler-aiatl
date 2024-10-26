import { Button } from "@mantine/core";
import supabase from "../utils/supabase";

function Login() {
    function signInWithGoogle() {
        supabase.auth.signInWithOAuth({
            provider: "google",
        })
    }


    return (
        <div className="flex justify-center items-center text-center min-h-[80vh]">
            <div className="flex flex-col gap-12 w-full max-w-[32rem]">
                <h1 className="text-4xl font-bold">Login!</h1>
                <Button fullWidth onClick={signInWithGoogle} radius={100} size="lg">Sign in with Google!</Button>
            </div>
        </div>
    );
}

export default Login;