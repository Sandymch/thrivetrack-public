import {
    confirmResetPassword,
    confirmSignIn,
    deleteUser,
    fetchUserAttributes,
    getCurrentUser,
    resetPassword,
    signIn,
    signOut,
} from "aws-amplify/auth";

export type CurrentUserProfile = {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
};

export async function getCurrentUserProfile(): Promise<CurrentUserProfile> {
    const attributes = await fetchUserAttributes();

    const firstName = attributes.given_name ?? "";
    const lastName = attributes.family_name ?? "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    const email = attributes.email;

    if (!email) {
        throw new Error("User email not found.");
    }

    return {
        firstName,
        lastName,
        fullName: fullName || "Member",
        email,
    };
}

export async function deleteCurrentUser(): Promise<void> {
    await deleteUser();
}

export async function clearCurrentSession(): Promise<void> {
    try {
        await signOut();
    } catch {
        // Ignore the absence of an existing authenticated session.
    }
}

export async function signInWithEmailAndPassword(
    email: string,
    password: string
) {
    await clearCurrentSession();

    return signIn({
        username: email.trim(),
        password,
    });
}

export async function getCurrentUserEmail(): Promise<string> {
    const attributes = await fetchUserAttributes();
    const email = attributes.email;

    if (!email) {
        throw new Error("User email not found.");
    }

    return email;
}

export async function isUserSignedIn(): Promise<boolean> {
    try {
        await getCurrentUser();
        return true;
    } catch {
        return false;
    }
}

export async function requestPasswordReset(email: string): Promise<void> {
    await resetPassword({
        username: email.trim(),
    });
}

export async function confirmPasswordReset(
    email: string,
    confirmationCode: string,
    newPassword: string
): Promise<void> {
    await confirmResetPassword({
        username: email.trim(),
        confirmationCode: confirmationCode.trim(),
        newPassword,
    });
}

export async function completeNewPasswordChallenge(password: string) {
    return confirmSignIn({
        challengeResponse: password,
    });
}

export function validatePassword(value: string): string | null {
    if (value.length < 8) {
        return "Password must contain at least 8 characters.";
    }

    if (!/[0-9]/.test(value)) {
        return "Password must contain at least one number.";
    }

    if (!/[A-Z]/.test(value)) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(value)) {
        return "Password must contain at least one lowercase letter.";
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
        return "Password must contain at least one special character.";
    }

    return null;
}
