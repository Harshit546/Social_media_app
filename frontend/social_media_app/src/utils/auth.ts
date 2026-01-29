export const getCurrentUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {
        const base64Payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(base64Payload));

        return {
            id: decodedPayload.id,
            email: decodedPayload.email,
            role: decodedPayload.role
        }
    } 
    catch (err) {
        console.error("Invalid token");
        return null;
    }
};
