
document.addEventListener("DOMContentLoaded", () => {
    const DISPUTE_KEY = "ds_disputes";
    const HISTORY_KEY = "ds_analysis_history";

    const form = document.getElementById("analysisForm");
    const disputeSelect = document.getElementById("analysisDisputeId");
    const customerInput = document.getElementById("analysisCustomer");
    const amountInput = document.getElementById("analysisAmount");
    const reasonInput = document.getElementById("analysisReason");
    const complaintInput = document.getElementById("analysisComplaint");
    const evidenceInput = document.getElementById("analysisEvidence");

    const message = document.getElementById("analysisMessage");
    const resultContainer = document.getElementById("analysisResult");
    const historyBody = document.getElementById("analysisHistoryBody");
    const runButton = document.getElementById("runAnalysisButton");

    let disputes = [];
    let history = [];

    function readStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Storage read error:", error);
            return [];
        }
    }

    function saveHistory() {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]);
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function formatDate(date) {
        if (!date) return "N/A";

        const parsed = new Date(date);

        return Number.isNaN(parsed.getTime())
            ? "N/A"
            : parsed.toLocaleString();
    }

    function loadDisputeOptions() {
        if (!disputeSelect) return;

        disputeSelect.innerHTML = `
            <option value="">Select a dispute</option>
            ${disputes.map(item => `
                <option value="${escapeHTML(item.id)}">
                    ${escapeHTML(item.id)} - ${escapeHTML(item.customerName)}
                </option>
            `).join("")}
        `;
    }

    function fillDisputeDetails(id) {
        const dispute = disputes.find(item => String(item.id) === String(id));

        if (!dispute) return;

        if (customerInput) customerInput.value = dispute.customerName || "";
        if (amountInput) amountInput.value = dispute.amount || "";
        if (reasonInput) reasonInput.value = dispute.disputeReason || "";
        if (complaintInput) complaintInput.value =
            dispute.complaintDescription || "";

        if (evidenceInput) {
            const files = Array.isArray(dispute.evidence)
                ? dispute.evidence.map(file => file.name).join(", ")
                : "";

            evidenceInput.value = files;
        }
    }

    function updateStatistics() {
        setText("totalAnalyses", history.length);

        const highRisk = history.filter(item =>
            String(item.riskLevel).toLowerCase() === "high"
        ).length;

        const classified = history.filter(item =>
            Boolean(item.classification)
        ).length;

        const reviewed = history.filter(item =>
            item.evidenceReviewed === true
        ).length;

        setText("highRiskCases", highRisk);
        setText("classifiedDisputes", classified);
        setText("evidenceReviewed", reviewed);
    }

    function renderHistory() {
        if (!historyBody) return;

        if (history.length === 0) {
            historyBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:20px;">
                        No analysis history available.
                    </td>
                </tr>
            `;
            return;
        }

        historyBody.innerHTML = [...history].reverse().map(item => `
            <tr>
                <td>${escapeHTML(item.disputeId)}</td>
                <td>${escapeHTML(item.customerName)}</td>
                <td>${escapeHTML(item.classification || "Not classified")}</td>
                <td>${escapeHTML(item.riskLevel || "Not assessed")}</td>
                <td>${formatDate(item.createdAt)}</td>
            </tr>
        `).join("");
    }

    function displayResult(result) {
        if (!resultContainer) return;

        resultContainer.innerHTML = `
            <div class="analysis-result-content">
                <h3>AI Analysis Result</h3>

                <p><strong>Classification:</strong>
                    ${escapeHTML(result.classification || "Not available")}
                </p>

                <p><strong>Risk Level:</strong>
                    ${escapeHTML(result.risk_level || result.riskLevel || "Not assessed")}
                </p>

                <p><strong>Confidence:</strong>
                    ${escapeHTML(result.confidence ?? "Not available")}
                </p>

                <p><strong>Summary:</strong></p>
                <p>${escapeHTML(result.summary || result.analysis || "No summary provided.")}</p>

                <p><strong>Recommended Action:</strong></p>
                <p>${escapeHTML(result.recommendation || "No recommendation provided.")}</p>
            </div>
        `;
    }

    async function runAIAnalysis(event) {
        event.preventDefault();

        const disputeId = disputeSelect?.value;
        const dispute = disputes.find(item => String(item.id) === String(disputeId));

        if (!dispute) {
            if (message) message.textContent = "Please select a valid dispute.";
            return;
        }

        if (!dispute.complaintDescription) {
            if (message) message.textContent = "Complaint description is missing.";
            return;
        }

        const requestData = {
            dispute_id: dispute.id,
            customer_name: dispute.customerName || "",
            customer_email: dispute.customerEmail || "",
            amount: Number(dispute.amount) || 0,
            dispute_reason: dispute.disputeReason || "",
            complaint: dispute.complaintDescription || "",
            evidence: Array.isArray(dispute.evidence)
                ? dispute.evidence.map(file => file.name)
                : []
        };

        if (runButton) {
            runButton.disabled = true;
            runButton.textContent = "Analyzing...";
        }

        if (message) {
            message.textContent = "Sending dispute details for AI analysis...";
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/analyze-dispute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || result.message || "AI analysis failed.");
            }

            displayResult(result);

            const record = {
                disputeId: dispute.id,
                customerName: dispute.customerName || "",
                classification: result.classification || "",
                riskLevel: result.risk_level || result.riskLevel || "",
                evidenceReviewed: result.evidence_reviewed === true,
                summary: result.summary || result.analysis || "",
                recommendation: result.recommendation || "",
                createdAt: new Date().toISOString()
            };

            history.push(record);
            saveHistory();

            updateStatistics();
            renderHistory();

            if (message) {
                message.textContent = "AI analysis completed successfully.";
            }

        } catch (error) {
            console.error("AI Analysis Error:", error);

            if (message) {
                message.textContent =
                    "Analysis could not be completed: " + error.message;
            }

        } finally {
            if (runButton) {
                runButton.disabled = false;
                runButton.textContent = "Run AI Analysis";
            }
        }
    }

    if (disputeSelect) {
        disputeSelect.addEventListener("change", () => {
            fillDisputeDetails(disputeSelect.value);
        });
    }

    if (form) {
        form.addEventListener("submit", runAIAnalysis);
    }

    function initialize() {
        disputes = readStorage(DISPUTE_KEY);
        history = readStorage(HISTORY_KEY);

        loadDisputeOptions();
        updateStatistics();
        renderHistory();

        if (message && disputes.length === 0) {
            message.textContent = "Add a dispute first before running AI analysis.";
        }
    }

    initialize();
});
