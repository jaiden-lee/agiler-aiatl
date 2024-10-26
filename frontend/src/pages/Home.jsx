import { Button } from "@mantine/core";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="flex items-center justify-center min-h-[80vh] flex-col gap-12">
            <h1 className="text-6xl font-bold text-center max-w-[80rem] px-8">Let your projects track themselves, while you focus on building.</h1>
            <Link to="/signup">
                <Button radius={100} className="text-white" size="lg">Try it out!</Button>
            </Link>
        </div>
    );
}

export default Home;