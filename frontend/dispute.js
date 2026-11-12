
document.addEventListener("DOMContentLoaded", () => {

    const disputeForm = document.getElementById("disputeForm");

    const evidenceFiles = document.getElementById("evidenceFiles");
    const selectedFiles = document.getElementById("selectedFiles");

    const formMessage = document.getElementById("formMessage");
    const submitButton = document.getElementById("submitDispute");


    // LOAD SELECTED EVIDENCE FILES

    if (evidenceFiles) {

        evidenceFiles.addEventListener("change", () => {

            if (!selectedFiles) return;

            selectedFiles.innerHTML = "";

            const files = Array.from(evidenceFiles.files);

            if (files.length === 0) {
                selectedFiles.textContent = "No files selected.";
                return;
            }

            files.forEach(file => {

                const item = document.createElement("div");

                item.className = "action-item";

                item.textContent =
                    "📄 " + file.name +
                    " (" + (file.size / 1024).toFixed(2) + " KB)";

                selectedFiles.appendChild(item);

            });

        });

    }


    // SHOW FORM MESSAGE

    function showMessage(message, type = "success") {

        if (!formMessage) return;

        formMessage.hidden = false;
        formMessage.textContent = message;

        formMessage.style.background =
            type === "error" ? "#ffe9e9" : "#e5f8ef";

        formMessage.style.color =
            type === "error" ? "#c0392b" : "#16845c";

    }


    // GET EXISTING DISPUTES

    function getDisputes() {

        try {

            return JSON.parse(
                localStorage.getItem("ds_disputes") || "[]"
            );

        } catch (error) {

            console.error("Storage error:", error);

            return [];

        }

    }


    // GENERATE UNIQUE DISPUTE ID

    function generateDisputeId() {

        return "DSP-" +
            Date.now().toString().slice(-8);

    }


    // SUBMIT NEW DISPUTE

    if (disputeForm) {

        disputeForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const customerName =
                document.getElementById("customerName").value.trim();

            const customerEmail =
                document.getElementById("customerEmail").value.trim();

            const transactionId =
                document.getElementById("transactionId").value.trim();

            const amount =
                Number(document.getElementById("amount").value);

            const transactionDate =
                document.getElementById("transactionDate").value;

            const paymentMethod =
                document.getElementById("paymentMethod").value;

            const disputeReason =
                document.getElementById("disputeReason").value;

            const complaintDescription =
                document.getElementById("complaintDescription").value.trim();


            // BASIC VALIDATION

            if (
                !customerName ||
                !customerEmail ||
                !transactionId ||
                !amount ||
                !transactionDate ||
                !paymentMethod ||
                !disputeReason ||
                !complaintDescription
            ) {

                showMessage(
                    "Please complete all required fields.",
                    "error"
                );

                return;

            }


            if (!Number.isFinite(amount) || amount <= 0) {

                showMessage(
                    "Please enter a valid disputed amount.",
                    "error"
                );

                return;

            }


            // COLLECT EVIDENCE FILE INFORMATION

            const files = evidenceFiles
                ? Array.from(evidenceFiles.files)
                : [];

            const evidence = files.map(file => ({

                name: file.name,

                size: file.size,

                type: file.type,

                uploadedAt: new Date().toISOString()

            }));


            // CREATE DISPUTE OBJECT

            const newDispute = {

                id: generateDisputeId(),

                customerName: customerName,

                customerEmail: customerEmail,

                transactionId: transactionId,

                amount: amount,

                transactionDate: transactionDate,

                paymentMethod: paymentMethod,

                disputeReason: disputeReason,

                complaintDescription: complaintDescription,

                evidence: evidence,

                status: "Pending",

                riskLevel: "Not Assessed",

                createdAt: new Date().toISOString()

            };


            // SAVE TO LOCAL STORAGE

            try {

                const disputes = getDisputes();

                disputes.push(newDispute);

                localStorage.setItem(
                    "ds_disputes",
                    JSON.stringify(disputes)
                );


                // SUCCESS MESSAGE

                showMessage(
                    "Dispute submitted successfully! Dispute ID: " +
                    newDispute.id
                );


                // RESET FORM

                disputeForm.reset();

                if (selectedFiles) {
                    selectedFiles.innerHTML = "";
                }


                // RESTORE BUTTON

                if (submitButton) {

                    submitButton.disabled = false;

                }

                console.log("New dispute saved:", newDispute);

            }

            catch (error) {

                console.error("Dispute submission error:", error);

                showMessage(
                    "Unable to save dispute. Please try again.",
                    "error"
                );

            }

        });

    }

});
