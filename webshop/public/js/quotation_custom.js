frappe.ui.form.on('Quotation', {
    refresh(frm) {
        if (frm.doc.docstatus === 0 && frappe.user_roles.includes("Sales Manager")) {
            frm.add_custom_button("Place Order for User", () => {
                frappe.call({
                    method: "webshop.api.place_order_from_cart",
                    args: { quotation_name: frm.doc.name },
                    freeze: true,
                    freeze_message: "Converting Quotation to Sales Order...",
                    callback: function(r) {
                        if (!r.exc && r.message) {
                            const sales_order_name = r.message;  // returned from backend

                            frappe.msgprint("Sales Order created successfully: " + sales_order_name);

                            frappe.call({
                                method: "erpnext.accounts.doctype.payment_request.payment_request.make_payment_request",
                                args: {
                                    dt: "Sales Order",
                                    dn: sales_order_name,
                                    recipient_id: frappe.session.user,
                                    use_payment_gateway: 1,
                                    payment_gateway: "Stripe",
                                },
                                callback: function(r2) {
                                    if (r2.message) {
                                        const pr = r2.message.name; // Payment Request name
                                        const redirect_url = `/stripe_checkout?amount=${r2.message.grand_total}&title=${encodeURIComponent(r2.message.subject)}&description=${encodeURIComponent(r2.message.subject)}&reference_doctype=Payment%20Request&reference_docname=${pr}&payer_email=${frappe.session.user}&payer_name=${frappe.session.user}&order_id=${pr}&currency=${r2.message.currency}&payment_gateway=Stripe`;
                                        window.location.href = redirect_url;
                                    }
                                }
                            });
                        }
                    }
                });
            }, "Actions");
        }
    }
});
