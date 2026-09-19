import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function authFetch<TResponse>(
    path: string,
    options: RequestInit = {},
    getFullError = false
): Promise<TResponse> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
        throw new Error("No JWT token found.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        let errorMessage = `API request failed: ${response.status}`;

        try {
            const errorBody = await response.json();

            if (errorBody && typeof errorBody === "object") {
                if (
                    "error" in errorBody &&
                    typeof errorBody.error === "string"
                ) {
                    errorMessage = errorBody.error;
                } else if (
                    "message" in errorBody &&
                    typeof errorBody.message === "string"
                ) {
                    errorMessage = errorBody.message;
                }

                if (
                    getFullError &&
                    "details" in errorBody &&
                    typeof errorBody.details === "string"
                ) {
                    errorMessage = `${errorMessage}: ${errorBody.details}`;
                }
            }
        } catch {
            // Keep the default error message if the response body is not valid JSON.
        }

        throw new Error(errorMessage);
    }

    return response.json() as Promise<TResponse>;
}

export type ResetStep = "request-code" | "confirm-code";

export type WorkloadRatings = {
    mentalDemand: number;
    physicalDemand: number;
    temporalDemand: number;
    performance: number;
    effort: number;
    frustration: number;
};

export type CreateWorkloadRecordRequest = {
    categoryName: string;
    taskName: string;
    taskStartAt: string; // ISO 8601 format
    taskEndAt: string; // ISO 8601 format
    ratings: WorkloadRatings;
    rawTlxScore: number;
};

export type CreateWorkloadRecordResponse = {
    message: string;
    recordId: string;
};

export type WorkloadRecord = CreateWorkloadRecordRequest & {
    recordId: string;
};

export type GetWorkloadRecordsResponse = {
    records: WorkloadRecord[];
};

export type GetWorkloadCategoriesResponse = {
    categories: string[];
};

export type WorkloadTrendPoint = {
    periodStart: string;
    averageScore: number;
    taskCount: number;
};

export type WorkloadCategoryDistribution = {
    categoryName: string;
    taskCount: number;
    percentage: number;
};

export type CategoryTrendPoint = {
    periodStart: string;
    [categoryName: string]: string | number;
};

export type GetWorkloadSummaryResponse = {
    months: number;
    trend: WorkloadTrendPoint[];
    categoryDistribution: WorkloadCategoryDistribution[];
    categoryTrend: CategoryTrendPoint[];
};

export type CreateDass21Request = {
    responses: Record<string, number>;
};

export type Dass21Scores = {
    depression: number;
    anxiety: number;
    stress: number;
};

export type CreateDass21Response = {
    message: string;
    assessmentId: string;
    assessmentStartAt: string;
    assessmentEndAt: string;
    scores: Dass21Scores;
};

export type Dass21AssessmentRecord = {
    assessmentId: string;
    assessmentStartAt: string;
    assessmentEndAt: string;
    scores: Dass21Scores;
}

export type GetDass21AssessmentsResponse = {
    records: Dass21AssessmentRecord[];
    count: number;
};


export type Dass21TrendPoint = {
    periodStart: string;
    depression: number;
    anxiety: number;
    stress: number;
    assessmentCount: number;
};

export type LatestDass21Assessment = {
    assessmentId: string;
    assessmentStartAt: string;
    assessmentEndAt: string;
    scores: Dass21Scores;
};

export type GetDass21SummaryResponse = {
    months: number;
    latestAssessment: LatestDass21Assessment | null;
    trend: Dass21TrendPoint[];
};

export type DeleteAccountDataResponse = {
    message: string;
    deleted: {
        dass21Responses: number;
        dass21Assessments: number;
        workloadRecords: number;
        workloadCategories: number;
    };
};

export function deleteAccountData(): Promise<DeleteAccountDataResponse> {
    return authFetch<DeleteAccountDataResponse>(
        "/account-data",
        { method: "DELETE" },
        true
    );
}

export type NotificationSettings = {
    email: string | null;
    wellbeingReminderEnabled: boolean;
    lastWellbeingReminderSentAt: string | null;
};

export type UpdateNotificationSettingsRequest = {
    wellbeingReminderEnabled: boolean;
    email?: string;
};

export type UpdateNotificationSettingsResponse = {
    message: string;
    email: string;
    wellbeingReminderEnabled: boolean;
    lastWellbeingReminderSentAt: string | null;
};

export function getNotificationSettings(): Promise<NotificationSettings> {
    return authFetch<NotificationSettings>(
        "/notification-settings",
        { method: "GET" },
        true
    );
}

export function updateNotificationSettings(
    payload: UpdateNotificationSettingsRequest
): Promise<UpdateNotificationSettingsResponse> {
    return authFetch<UpdateNotificationSettingsResponse>(
        "/notification-settings",
        {
            method: "PUT",
            body: JSON.stringify(payload),
        },
        true
    );
}

export async function getDass21Summary(
    months: number
): Promise<GetDass21SummaryResponse> {
    return authFetch<GetDass21SummaryResponse>(
        `/dass21-summary?months=${months}`,
        { method: "GET" },
        true
    );
}

export async function getDass21Assessments(
    limit: number
): Promise<GetDass21AssessmentsResponse> {
    return authFetch<GetDass21AssessmentsResponse>(
        `/dass21-assessment?limit=${limit}`,
        {
            method: "GET",
        },
        true
    );
}

export async function createWorkloadRecord(
    payload: CreateWorkloadRecordRequest
): Promise<CreateWorkloadRecordResponse> {
    return authFetch<CreateWorkloadRecordResponse>("/workload-record", {
        method: "POST",
        body: JSON.stringify(payload),
    },
        true
    );
}

export async function getWorkloadRecords(
    limit: number
): Promise<GetWorkloadRecordsResponse> {
    return authFetch<GetWorkloadRecordsResponse>(
        `/workload-record?limit=${limit}`,
        {
            method: "GET",
        },
        true
    );
}

export async function getWorkloadSummary(
    months: number
): Promise<GetWorkloadSummaryResponse> {
    return authFetch<GetWorkloadSummaryResponse>(
        `/workload-summary?months=${months}`,
        {
            method: "GET",
        },
        true
    );
}

export function getWorkloadCategories(): Promise<GetWorkloadCategoriesResponse> {
    return authFetch<GetWorkloadCategoriesResponse>(
        "/workload-categories",
        {
            method: "GET",
        },
        true
    );
}

export function createDass21Assessment(
    payload: CreateDass21Request
): Promise<CreateDass21Response> {
    return authFetch<CreateDass21Response>(
        `/dass21-assessment`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        },
        true
    );
}