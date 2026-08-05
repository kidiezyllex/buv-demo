export type BackupType = "backup" | "restore";
export type BackupStatus = "success" | "failed";

export interface ICollectionSummary {
    name: string;
    count: number;
}

export interface IBackupHistory {
    _id: string;
    type: BackupType;
    fileName: string;
    performedBy: string | { _id: string; fullName: string };
    status: BackupStatus;
    collectionsSummary: ICollectionSummary[];
    totalRecords: number;
    fileSizeBytes: number;
    checksum: string;
    errorMessage?: string;
    createdAt: string;
}

export interface IBackupHistoryListResponse {
    history: IBackupHistory[];
    pagination: {
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface ICollectionsInfoResponse {
    collections: ICollectionSummary[];
    totalRecords: number;
}

export interface IRestoreComparisonItem {
    name: string;
    currentCount: number;
    fileCount: number;
}

export interface IRestoreValidateResponse {
    schemaVersionMatch: boolean;
    checksum: string;
    comparison: IRestoreComparisonItem[];
}

export interface IRestoreExecuteResponse {
    totalRecords: number;
    collectionsSummary: ICollectionSummary[];
}
