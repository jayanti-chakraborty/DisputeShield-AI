
document.addEventListener("DOMContentLoaded", () => {
    const disputes = JSON.parse(localStorage.getItem("ds_disputes") || "[]");

    // Dashboard statistics
    const total = disputes.length;

    const open = disputes.filter(d =>
        ["pending", "analyzing", "failed"].includes(
            (d.status || "pending").toLowerCase()
        )
    ).length;

    const resolved = disputes.filter(d =>
        (d.status || "").toLowerCase() === "resolved"
    ).length;

    const totalAmount = disputes.reduce(
        (sum, d) => sum + (Number(d.amount) || 0), 0
    );

    // Update dashboard cards
    setText("openDisputes", open);
    setText("activeDisputes", open);
    setText("resolvedDisputes", resolved);

    setText(
        "totalAmount",
        "₹" + totalAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    );

    // Status breakdown
    renderStatusBreakdown(disputes);

    // Recent transactions
    renderRecentTransactions(disputes);
});

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function renderStatusBreakdown(disputes) {
    const container = document.getElementById("statusBreakdown");

    if (!container) return;

    if (disputes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No dispute data available yet.
            </div>
        `;
        return;
    }

    const statuses = {
        Pending: 0,
        Analyzing: 0,
        Resolved: 0,
        Failed: 0
    };

    disputes.forEach(dispute => {
        const status = (dispute.status || "pending").toLowerCase();

        if (status === "pending") statuses.Pending++;
        else if (status === "analyzing") statuses.Analyzing++;
        else if (status === "resolved") statuses.Resolved++;
        else if (status === "failed") statuses.Failed++;
    });

    container.innerHTML = Object.entries(statuses)
        .map(([status, count]) => `
            <div class="action-item">
                <span>${status}</span>
                <strong>${count}</strong>
            </div>
        `)
        .join("");
}

function renderRecentTransactions(disputes) {
    const container = document.getElementById("recentTransactions");

    if (!container) return;

    if (disputes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No transactions found. Create your first dispute.
            </div>
        `;
        return;
    }

    const recent = [...disputes]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

    container.innerHTML = recent.map(dispute => {
        const name = escapeHTML(dispute.customerName || "Unknown");
        const id = escapeHTML(dispute.id || "N/A");
        const status = escapeHTML(dispute.status || "Pending");
        const amount = Number(dispute.amount) || 0;

        return `
            <div class="action-item">
                <div>
                    <strong>${name}</strong>
                    <p>${id}</p>
                </div>

                <div>
                    <strong>₹${amount.toLocaleString("en-IN")}</strong>
                    <span class="badge">${status}</span>
                </div>
            </div>
        `;
    }).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
