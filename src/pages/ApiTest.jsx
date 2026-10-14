
import { useEffect, useState } from "react";
import api from "../apis/axiosClient";

export default function ApiTest() {
    const [message, setMessage] = useState("Connecting to Laravel...");
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/test")
            .then((response) => {
                setMessage(response.data.message);
                setError("");
            })
            .catch((err) => {
                console.error("Laravel API error:", err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to connect to Laravel"
                );
            });
    }, []);

    return (
        <div style={{ padding: "30px" }}>
            <h1>HeyDiamond API Connection</h1>

            {error ? (
                <p style={{ color: "red" }}>Error: {error}</p>
            ) : (
                <p>{message}</p>
            )}
        </div>
    );
}
