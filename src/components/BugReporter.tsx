import { Bug } from 'lucide-react';

interface BugReporterProps {
    rawCSV?: string | null;
}

export const BugReporter: React.FC<BugReporterProps> = ({ rawCSV }) => {
    const handleReport = () => {
        const subject = encodeURIComponent("Strong Wrapped Bug Report");
        let bodyText = "Please describe the issue you encountered:\n\n\n\n";

        if (rawCSV) {
            // Trigger download
            const blob = new Blob([rawCSV], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'strong_debug_data.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            bodyText += "[I have automatically downloaded your CSV data as 'strong_debug_data.csv'. Please attach this file to this email.]";
        } else {
            bodyText += "[IMPORTANT: Please attach your strong.csv file to this email.]";
        }

        const body = encodeURIComponent(bodyText);
        // TODO: Add your support email here (e.g. support@example.com)
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <button
            onClick={handleReport}
            className="fixed bottom-4 right-4 z-50 p-3 bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full backdrop-blur-md transition-all border border-white/5 shadow-lg group"
            title="Report a Bug"
        >
            <Bug size={20} className="group-hover:scale-110 transition-transform" />
            <span className="sr-only">Report Bug</span>
        </button>
    );
};
