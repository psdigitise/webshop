frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        if (!frm.is_new() && frm.doc.docstatus === 1) {
            frm.add_custom_button('Proceed to Payment', () => {
                frappe.call({
                    method: "webshop.api.get_stripe_redirect_url",
                    args: {
                        sales_order: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            window.location.href = r.message; 
                        } else {
                            frappe.msgprint("Unable to generate payment link.");
                        }
                    }
                });
            }, "Actions");
        }
    }
});
