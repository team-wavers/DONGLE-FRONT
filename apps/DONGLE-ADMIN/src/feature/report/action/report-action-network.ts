import {
    createClubReportService,
    updateClubReportService,
} from "@dongle/service/club/club.report.service";
import { uploadReportImages } from "./upload-report-images";

export interface ReportActionNetwork {
    uploadImages: (options: { clubId: string; images: File[] }) => Promise<string[]>;
    createReport: typeof createClubReportService;
    updateReport: typeof updateClubReportService;
}

export const reportActionNetwork: ReportActionNetwork = {
    uploadImages: uploadReportImages,
    createReport: createClubReportService,
    updateReport: updateClubReportService,
};
