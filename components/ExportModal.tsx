"use client";
import { X } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportModalProps {
    open: boolean;
    onClose: () => void;
    data: any[];
    title?: string;
}

export default function ExportModal({
    open,
    onClose,
    data = [],
    title = "Export As",
}: ExportModalProps) {
    if (!open) return null;

    /** --- Export Handlers --- */
    const exportCSV = () => {
        if (!data.length) return;
        const header = Object.keys(data[0]);
        const csv = [
            header.join(","),
            ...data.map((row) =>
                header.map((field) => JSON.stringify(row[field] ?? "")).join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "export.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportExcel = () => {
        if (!data.length) return;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "export.xlsx");
    };

    const exportPDF = () => {
        if (!data.length) return;

        const doc = new jsPDF();

        // Convert object keys & values safely
        const headers = [Object.keys(data[0]) as string[]];
        const rows = data.map((row) =>
            Object.values(row).map((v) => String(v ?? "")) // ensure string type
        );

        // ✅ Correct type for autoTable
        autoTable(doc, {
            head: headers,
            body: rows as (string | number)[][],
        });

        doc.save("export.pdf");
    };


    /** --- UI --- */
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-72 text-center relative">
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-semibold mb-4">{title}</h2>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => {
                            exportExcel();
                            onClose();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
                    >
                        Excel (.xlsx)
                    </button>

                    <button
                        onClick={() => {
                            exportCSV();
                            onClose();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
                    >
                        CSV (.csv)
                    </button>

                    <button
                        onClick={() => {
                            exportPDF();
                            onClose();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
                    >
                        PDF (.pdf)
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
