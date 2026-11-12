

document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY = "ds_disputes";
    const PAYMENT_KEY = "ds_payments";

    const searchInput = document.getElementById("transactionSearch");
    const statusFilter = document.getElementById("statusFilter");
    const reasonFilter = document.getElementById("reasonFilter");
    const tableBody = document.getElementById("transactionTableBody");
    const message = document.getElementById("transactionMessage");
    const detailsContainer = document.getElementById("transactionDetails");

    let disputes = [];
    let payments = [];
    let allTransactions = [];

    function getStorageData(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Storage Error:", error);
            return [];
        }
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

    function formatAmount(amount) {
        const number = Number(amount);
        return Number.isFinite(number)
            ? "$" + number.toFixed(2)
            : "$0.00";
    }

    function formatDate(date) {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "N/A";

        return parsedDate.toLocaleDateString();
    }

    function normalizeStatus(status) {
        return String(status || "Pending").toLowerCase().trim();
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function getStatusClass(status) {
        const normalized = normalizeStatus(status);

        if (normalized === "completed" || normalized === "resolved") {
            return "resolved";
        }

        if (normalized === "analyzing") return "analyzing";
        if (normalized === "failed") return "failed";

        return "pending";
    }

    // Combine Disputes and PayPal Payments
    function loadTransactions() {

        disputes = getStorageData(STORAGE_KEY);
        payments = getStorageData(PAYMENT_KEY);

        const disputeRecords = disputes.map(item => ({
            ...item,
            type: "dispute"
        }));

        const paymentRecords = payments.map(item => ({
            id: item.orderId,
            transactionId: item.orderId,
            customerName: "PayPal Customer",
            amount: item.amount,
            transactionDate: item.date,
            disputeReason: "PayPal Payment",
            status: item.status,
            paymentMethod: "PayPal",
            type: "payment"
        }));

        allTransactions = [
            ...paymentRecords,
            ...disputeRecords
        ];
    }

    // Statistics
    function updateStatistics() {

        const total = allTransactions.length;

        const pending = allTransactions.filter(item =>
            normalizeStatus(item.status) === "pending"
        ).length;

        const analyzing = allTransactions.filter(item =>
            normalizeStatus(item.status) === "analyzing"
        ).length;

        const completed = allTransactions.filter(item =>
            ["completed", "resolved"].includes(
                normalizeStatus(item.status)
            )
        ).length;

        setText("totalTransactions", total);
        setText("pendingTransactions", pending);
        setText("analyzingTransactions", analyzing);
        setText("completedTransactions", completed);
    }

    // Render Transactions
    function renderTransactions() {

        if (!tableBody) return;

        const searchTerm =
            searchInput?.value.toLowerCase().trim() || "";

        const selectedStatus = statusFilter?.value || "all";
        const selectedReason = reasonFilter?.value || "all";

        const filtered = allTransactions.filter(item => {

            const searchableText = [
                item.id,
                item.customerName,
                item.customerEmail,
                item.transactionId,
                item.disputeReason,
                item.paymentMethod
            ].join(" ").toLowerCase();

            const matchesSearch =
                searchableText.includes(searchTerm);

            const matchesStatus =
                selectedStatus === "all" ||
                normalizeStatus(item.status) === selectedStatus;

            const matchesReason =
                selectedReason === "all" ||
                item.disputeReason === selectedReason;

            return matchesSearch && matchesStatus && matchesReason;
        });

        if (filtered.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:25px;">
                        No transactions found.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = filtered.map(item => {

            const status = item.status || "Pending";
            const statusClass = getStatusClass(status);

            return `
                <tr>
                    <td>${escapeHTML(item.transactionId || item.id || "N/A")}</td>

                    <td>${escapeHTML(item.customerName || "Unknown")}</td>

                    <td>${formatAmount(item.amount)}</td>

                    <td>${formatDate(item.transactionDate || item.createdAt)}</td>

                    <td>${escapeHTML(item.disputeReason || "N/A")}</td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>
                        <button
                            type="button"
                            class="view-btn"
                            data-view-id="${escapeHTML(item.id)}"
                            data-view-type="${item.type}">
                            View
                        </button>
                    </td>
                </tr>
            `;

        }).join("");
    }

    // Transaction Details
    function showTransactionDetails(id, type) {

        const item = allTransactions.find(record =>
            String(record.id) === String(id) &&
            record.type === type
        );

        if (!item) return;

        if (!detailsContainer) return;

        if (type === "payment") {

            detailsContainer.innerHTML = `
                <div class="transaction-detail-content">

                    <h3>PayPal Payment Details</h3>

                    <p><strong>Order ID:</strong>
                        ${escapeHTML(item.transactionId)}</p>

                    <p><strong>Payment Method:</strong> PayPal</p>

                    <p><strong>Customer:</strong> PayPal Customer</p>

                    <p><strong>Amount:</strong>
                        ${formatAmount(item.amount)}</p>

                    <p><strong>Currency:</strong> USD</p>

                    <p><strong>Payment Date:</strong>
                        ${formatDate(item.transactionDate)}</p>

                    <p><strong>Payment Status:</strong>
                        ${escapeHTML(item.status)}</p>

                    <button type="button" id="closeTransactionDetails">
                        Close
                    </button>

                </div>
            `;

        } else {

            detailsContainer.innerHTML = `
                <div class="transaction-detail-content">

                    <h3>Transaction Details</h3>

                    <p><strong>Dispute ID:</strong>
                        ${escapeHTML(item.id)}</p>

                    <p><strong>Transaction ID:</strong>
                        ${escapeHTML(item.transactionId)}</p>

                    <p><strong>Customer:</strong>
                        ${escapeHTML(item.customerName)}</p>

                    <p><strong>Email:</strong>
                        ${escapeHTML(item.customerEmail)}</p>

                    <p><strong>Amount:</strong>
                        ${formatAmount(item.amount)}</p>

                    <p><strong>Date:</strong>
                        ${formatDate(item.transactionDate)}</p>

                    <p><strong>Payment Method:</strong>
                        ${escapeHTML(item.paymentMethod)}</p>

                    <p><strong>Dispute Reason:</strong>
                        ${escapeHTML(item.disputeReason)}</p>

                    <p><strong>Status:</strong>
                        ${escapeHTML(item.status)}</p>

                    <p><strong>Complaint:</strong></p>

                    <p>${escapeHTML(item.complaintDescription)}</p>

                    <button type="button" id="closeTransactionDetails">
                        Close
                    </button>

                </div>
            `;
        }

        const closeButton =
            document.getElementById("closeTransactionDetails");

        if (closeButton) {
            closeButton.addEventListener("click", () => {
                detailsContainer.innerHTML = "";
            });
        }
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener("input", renderTransactions);
    }

    // Status Filter
    if (statusFilter) {
        statusFilter.addEventListener("change", renderTransactions);
    }

    // Reason Filter
    if (reasonFilter) {
        reasonFilter.addEventListener("change", renderTransactions);
    }

    // View Button
    if (tableBody) {

        tableBody.addEventListener("click", event => {

            const button = event.target.closest("[data-view-id]");

            if (button) {

                showTransactionDetails(
                    button.dataset.viewId,
                    button.dataset.viewType
                );

            }
        });
    }

    // Initialize
    function initialize() {

        loadTransactions();

        updateStatistics();

        renderTransactions();

        if (message) {
            message.textContent =
                `${payments.length} PayPal payment(s) and ` +
                `${disputes.length} dispute(s) loaded.`;
        }
    }

    initialize();

});
